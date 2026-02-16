import { prisma } from '../lib/prisma';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';

export class BoardService {
  async getUserBoards(userId: string, page: number, limit: number, search?: string, workspaceId?: string) {
    const where: any = {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
      ...(search ? { title: { contains: search } } : {}),
    };

    // Filter by workspace if provided
    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    const [boards, total] = await Promise.all([
      prisma.board.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, email: true, avatar: true } },
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, avatar: true } },
            },
          },
          _count: { select: { lists: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.board.count({ where }),
    ]);

    return {
      boards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBoardById(boardId: string, userId: string) {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
        lists: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' },
              include: {
                assignees: {
                  include: {
                    user: { select: { id: true, name: true, email: true, avatar: true } },
                  },
                },
                labels: { include: { label: true } },
                _count: { select: { comments: true } },
              },
            },
          },
        },
        labels: true,
      },
    });

    if (!board) throw new NotFoundError('Board not found');
    await this.verifyBoardAccess(boardId, userId);
    return board;
  }

  async createBoard(data: { title: string; description?: string; color?: string; workspaceId?: string }, userId: string) {
    const board = await prisma.board.create({
      data: {
        title: data.title,
        description: data.description,
        color: data.color || '#6366f1',
        ownerId: userId,
        workspaceId: data.workspaceId || null,
        members: {
          create: { userId, role: 'admin' },
        },
        lists: {
          createMany: {
            data: [
              { title: 'To Do', position: 0 },
              { title: 'In Progress', position: 1 },
              { title: 'Done', position: 2 },
            ],
          },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
        lists: { orderBy: { position: 'asc' }, include: { tasks: true } },
        labels: true,
      },
    });

    return board;
  }

  async updateBoard(boardId: string, data: { title?: string; description?: string; color?: string }, userId: string) {
    await this.verifyBoardAccess(boardId, userId);
    const board = await prisma.board.update({
      where: { id: boardId },
      data,
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
        _count: { select: { lists: true } },
      },
    });
    return board;
  }

  async deleteBoard(boardId: string, userId: string) {
    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) throw new NotFoundError('Board not found');
    if (board.ownerId !== userId) throw new ForbiddenError('Only the board owner can delete it');

    await prisma.board.delete({ where: { id: boardId } });
    return { message: 'Board deleted successfully' };
  }

  async removeMember(boardId: string, memberId: string, userId: string) {
    await this.verifyBoardAdmin(boardId, userId);
    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (board?.ownerId === memberId) throw new BadRequestError('Cannot remove the board owner');

    await prisma.boardMember.deleteMany({
      where: { boardId, userId: memberId },
    });
    return { message: 'Member removed' };
  }

  async verifyBoardAccess(boardId: string, userId: string) {
    const member = await prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    if (!member) {
      const board = await prisma.board.findUnique({ where: { id: boardId } });
      if (!board || board.ownerId !== userId) {
        throw new ForbiddenError('You do not have access to this board');
      }
    }
  }

  async verifyBoardAdmin(boardId: string, userId: string) {
    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) throw new NotFoundError('Board not found');
    if (board.ownerId === userId) return;

    const member = await prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    if (!member || member.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }
  }
}

export const boardService = new BoardService();
