import { prisma } from '../index';
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/errors';

export class WorkspaceService {
  async getUserWorkspaces(userId: string) {
    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
        boards: {
          include: {
            members: {
              include: {
                user: { select: { id: true, name: true, email: true, avatar: true } },
              },
            },
            _count: { select: { lists: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { boards: true, members: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return workspaces;
  }

  async getWorkspaceById(workspaceId: string, userId: string) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
        boards: {
          include: {
            members: {
              include: {
                user: { select: { id: true, name: true, email: true, avatar: true } },
              },
            },
            _count: { select: { lists: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { boards: true, members: true } },
      },
    });
    if (!workspace) throw new NotFoundError('Workspace not found');
    const isMember = workspace.ownerId === userId || workspace.members.some(m => m.userId === userId);
    if (!isMember) throw new ForbiddenError('Not a member of this workspace');
    return workspace;
  }

  async createWorkspace(data: { name: string; color?: string; icon?: string }, userId: string) {
    const workspace = await prisma.workspace.create({
      data: {
        name: data.name,
        color: data.color || '#6366f1',
        icon: data.icon,
        ownerId: userId,
        members: {
          create: { userId, role: 'owner' },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
        boards: true,
        _count: { select: { boards: true, members: true } },
      },
    });
    return workspace;
  }

  async updateWorkspace(workspaceId: string, data: { name?: string; color?: string; icon?: string }, userId: string) {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new NotFoundError('Workspace not found');
    if (workspace.ownerId !== userId) throw new ForbiddenError('Only workspace owner can update');

    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
      data,
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
        boards: true,
        _count: { select: { boards: true, members: true } },
      },
    });
    return updated;
  }

  async deleteWorkspace(workspaceId: string, userId: string) {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new NotFoundError('Workspace not found');
    if (workspace.ownerId !== userId) throw new ForbiddenError('Only workspace owner can delete');

    await prisma.workspace.delete({ where: { id: workspaceId } });
    return { message: 'Workspace deleted' };
  }

  async addMember(workspaceId: string, userId: string, role: string, requesterId: string) {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new NotFoundError('Workspace not found');
    if (workspace.ownerId !== requesterId) {
      const requesterMember = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: requesterId } },
      });
      if (!requesterMember || requesterMember.role !== 'admin') {
        throw new ForbiddenError('Only owner/admin can add members');
      }
    }

    const existing = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (existing) throw new ConflictError('User is already a member');

    const member = await prisma.workspaceMember.create({
      data: { workspaceId, userId, role },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });
    return member;
  }

  async removeMember(workspaceId: string, userId: string, requesterId: string) {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new NotFoundError('Workspace not found');
    if (workspace.ownerId !== requesterId && userId !== requesterId) {
      throw new ForbiddenError('Only owner can remove members');
    }
    if (workspace.ownerId === userId) throw new ForbiddenError('Cannot remove owner');

    await prisma.workspaceMember.deleteMany({ where: { workspaceId, userId } });
    return { message: 'Member removed' };
  }

  async inviteByEmail(workspaceId: string, email: string, requesterId: string) {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new NotFoundError('Workspace not found');

    // Check requester is owner/admin
    if (workspace.ownerId !== requesterId) {
      const requesterMember = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: requesterId } },
      });
      if (!requesterMember || !['admin', 'owner'].includes(requesterMember.role)) {
        throw new ForbiddenError('Only owner/admin can invite members');
      }
    }

    // Find user by email
    const invitee = await prisma.user.findUnique({ where: { email } });
    if (!invitee) throw new NotFoundError('No user found with that email');

    // Check if already a member
    const existing = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: invitee.id } },
    });
    if (existing) throw new ConflictError('User is already a member of this workspace');

    // Add as member
    const member = await prisma.workspaceMember.create({
      data: { workspaceId, userId: invitee.id, role: 'member' },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });

    return member;
  }
}

export const workspaceService = new WorkspaceService();
