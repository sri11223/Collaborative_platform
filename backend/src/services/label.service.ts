import { prisma } from '../lib/prisma';
import { NotFoundError } from '../utils/errors';
import { boardService } from './board.service';

export class LabelService {
  async getBoardLabels(boardId: string, userId: string) {
    await boardService.verifyBoardAccess(boardId, userId);
    return prisma.label.findMany({
      where: { boardId },
      include: { _count: { select: { tasks: true } } },
    });
  }

  async createLabel(boardId: string, data: { name: string; color: string }, userId: string) {
    await boardService.verifyBoardAccess(boardId, userId);
    return prisma.label.create({
      data: { name: data.name, color: data.color, boardId },
    });
  }

  async updateLabel(labelId: string, data: { name?: string; color?: string }, userId: string) {
    const label = await prisma.label.findUnique({ where: { id: labelId } });
    if (!label) throw new NotFoundError('Label not found');
    await boardService.verifyBoardAccess(label.boardId, userId);

    return prisma.label.update({
      where: { id: labelId },
      data,
    });
  }

  async deleteLabel(labelId: string, userId: string) {
    const label = await prisma.label.findUnique({ where: { id: labelId } });
    if (!label) throw new NotFoundError('Label not found');
    await boardService.verifyBoardAccess(label.boardId, userId);

    await prisma.label.delete({ where: { id: labelId } });
    return { message: 'Label deleted' };
  }
}

export const labelService = new LabelService();
