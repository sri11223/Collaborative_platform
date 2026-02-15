import { prisma } from '../index';
import { NotFoundError } from '../utils/errors';
import { boardService } from './board.service';

export class ListService {
  async getListsByBoard(boardId: string, userId: string) {
    await boardService.verifyBoardAccess(boardId, userId);
    const lists = await prisma.list.findMany({
      where: { boardId },
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
    });
    return lists;
  }

  async createList(boardId: string, title: string, userId: string) {
    await boardService.verifyBoardAccess(boardId, userId);

    const maxPosition = await prisma.list.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const list = await prisma.list.create({
      data: {
        title,
        boardId,
        position: (maxPosition?.position ?? -1) + 1,
      },
      include: { tasks: true },
    });
    return list;
  }

  async updateList(listId: string, data: { title?: string }, userId: string) {
    const list = await prisma.list.findUnique({ where: { id: listId } });
    if (!list) throw new NotFoundError('List not found');
    await boardService.verifyBoardAccess(list.boardId, userId);

    const updated = await prisma.list.update({
      where: { id: listId },
      data,
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
    });
    return updated;
  }

  async deleteList(listId: string, userId: string) {
    const list = await prisma.list.findUnique({ where: { id: listId } });
    if (!list) throw new NotFoundError('List not found');
    await boardService.verifyBoardAccess(list.boardId, userId);

    await prisma.list.delete({ where: { id: listId } });

    // Reorder remaining lists
    const remainingLists = await prisma.list.findMany({
      where: { boardId: list.boardId },
      orderBy: { position: 'asc' },
    });
    for (let i = 0; i < remainingLists.length; i++) {
      await prisma.list.update({
        where: { id: remainingLists[i].id },
        data: { position: i },
      });
    }

    return { message: 'List deleted', boardId: list.boardId };
  }

  async reorderLists(boardId: string, listOrders: { id: string; position: number }[], userId: string) {
    await boardService.verifyBoardAccess(boardId, userId);

    await prisma.$transaction(
      listOrders.map((item) =>
        prisma.list.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      )
    );

    return await this.getListsByBoard(boardId, userId);
  }
}

export const listService = new ListService();
