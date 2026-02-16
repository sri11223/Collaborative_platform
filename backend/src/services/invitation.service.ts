import { prisma } from '../lib/prisma';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors';
import { boardService } from './board.service';
import { activityService } from './activity.service';
import { sendEmail, buildInviteEmail } from '../utils/email';
import { config } from '../config';

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

    // Send invitation email
    const inviteLink = `${config.clientUrl}/invite/${invitation.token}`;
    const emailContent = buildInviteEmail({
      inviterName: invitation.inviter.name,
      boardTitle: invitation.board.title,
      role: invitation.role,
      inviteLink,
    });
    await sendEmail({
      to: data.email,
      subject: emailContent.subject,
      html: emailContent.html,
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

    // Also add user to the board's workspace if not already a member
    if (invitation.board.workspaceId) {
      const existingWsMember = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId: invitation.board.workspaceId, userId } },
      });
      if (!existingWsMember) {
        await prisma.workspaceMember.create({
          data: { workspaceId: invitation.board.workspaceId, userId, role: 'member' },
        });
      }
    }

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

  async getInvitationByToken(token: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        board: { select: { id: true, title: true, color: true } },
        inviter: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
    if (!invitation) throw new NotFoundError('Invitation not found');
    if (invitation.status !== 'pending') throw new BadRequestError('Invitation is no longer pending');
    if (invitation.expiresAt < new Date()) throw new BadRequestError('Invitation has expired');
    return invitation;
  }

  async acceptByToken(token: string, userId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { board: true },
    });
    if (!invitation) throw new NotFoundError('Invitation not found');
    if (invitation.status !== 'pending') throw new BadRequestError('Invitation is no longer pending');
    if (invitation.expiresAt < new Date()) throw new BadRequestError('Invitation has expired');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');

    // Check email match
    if (user.email !== invitation.inviteeEmail) {
      throw new BadRequestError('This invitation was sent to a different email address');
    }

    // Check if already a member
    const existing = await prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId: invitation.boardId, userId } },
    });
    if (existing) {
      await prisma.invitation.update({ where: { token }, data: { status: 'accepted' } });
      return { message: 'Already a member', boardId: invitation.boardId };
    }

    await prisma.boardMember.create({
      data: { boardId: invitation.boardId, userId, role: invitation.role },
    });

    // Also add user to the board's workspace if not already a member
    if (invitation.board.workspaceId) {
      const existingWsMember = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId: invitation.board.workspaceId, userId } },
      });
      if (!existingWsMember) {
        await prisma.workspaceMember.create({
          data: { workspaceId: invitation.board.workspaceId, userId, role: 'member' },
        });
      }
    }

    await prisma.invitation.update({ where: { token }, data: { status: 'accepted' } });

    await activityService.log({
      type: 'member_joined',
      description: 'joined via invite link',
      boardId: invitation.boardId,
      userId,
    });

    return { message: 'Invitation accepted', boardId: invitation.boardId };
  }
}

export const invitationService = new InvitationService();
