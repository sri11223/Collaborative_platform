import { prisma } from '../index';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors';
import { boardService } from './board.service';
import { activityService } from './activity.service';

export class InvitationService {
  async createInvitation(
    boardId: string,
    data: { email: string; role?: string },
    inviterId: string
  ) {
    await boardService.verifyBoardAdmin(boardId, inviterId);

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      const existingMember = await prisma.boardMember.findUnique({
        where: { boardId_userId: { boardId, userId: existingUser.id } },
      });
      if (existingMember) throw new ConflictError('User is already a board member');
    }

    // Check for existing pending invitation
    const existingInvite = await prisma.invitation.findFirst({
      where: { boardId, inviteeEmail: data.email, status: 'pending' },
    });
    if (existingInvite) throw new ConflictError('Invitation already sent to this email');

    const invitation = await prisma.invitation.create({
      data: {
        boardId,
        inviterId,
        inviteeEmail: data.email,
        role: data.role || 'member',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      include: {
        board: { select: { id: true, title: true } },
        inviter: { select: { id: true, name: true, email: true } },
      },
    });

    return invitation;
  }

  async getUserInvitations(userEmail: string) {
    const invitations = await prisma.invitation.findMany({
      where: {
        inviteeEmail: userEmail,
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
      include: {
        board: { select: { id: true, title: true, color: true } },
        inviter: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return invitations;
  }

  async acceptInvitation(invitationId: string, userId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: { board: true },
    });
    if (!invitation) throw new NotFoundError('Invitation not found');
    if (invitation.status !== 'pending') throw new BadRequestError('Invitation is no longer pending');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.email !== invitation.inviteeEmail) {
      throw new BadRequestError('This invitation is not for you');
    }

    // Add user to board
    await prisma.boardMember.create({
      data: {
        boardId: invitation.boardId,
        userId,
        role: invitation.role,
      },
    });

    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: 'accepted' },
    });

    await activityService.log({
      type: 'member_joined',
      description: `joined the board`,
      boardId: invitation.boardId,
      userId,
    });

    return { message: 'Invitation accepted', boardId: invitation.boardId };
  }

  async declineInvitation(invitationId: string, userId: string) {
    const invitation = await prisma.invitation.findUnique({ where: { id: invitationId } });
    if (!invitation) throw new NotFoundError('Invitation not found');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.email !== invitation.inviteeEmail) {
      throw new BadRequestError('This invitation is not for you');
    }

    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: 'declined' },
    });

    return { message: 'Invitation declined' };
  }

  async getBoardInvitations(boardId: string, userId: string) {
    await boardService.verifyBoardAccess(boardId, userId);

    const invitations = await prisma.invitation.findMany({
      where: { boardId, status: 'pending' },
      include: {
        inviter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return invitations;
  }
}

export const invitationService = new InvitationService();
