import { prisma } from '../lib/prisma';
import { NotFoundError, ConflictError, ForbiddenError } from '../utils/errors';

export class FavoriteService {
  async getUserFavorites(userId: string) {
    const favorites = await prisma.favoriteBoard.findMany({
      where: { userId },
      include: {
        board: {
          include: {
            owner: { select: { id: true, name: true, email: true, avatar: true } },
            _count: { select: { lists: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return favorites;
  }

  async addFavorite(userId: string, boardId: string) {
    // Verify board exists
    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) throw new NotFoundError('Board not found');

    // Check if already favorited
    const existing = await prisma.favoriteBoard.findUnique({
      where: { userId_boardId: { userId, boardId } },
    });
    if (existing) throw new ConflictError('Board already in favorites');

    const favorite = await prisma.favoriteBoard.create({
      data: { userId, boardId },
      include: {
        board: {
          include: {
            owner: { select: { id: true, name: true, email: true, avatar: true } },
            _count: { select: { lists: true } },
          },
        },
      },
    });
    return favorite;
  }

  async removeFavorite(userId: string, boardId: string) {
    const existing = await prisma.favoriteBoard.findUnique({
      where: { userId_boardId: { userId, boardId } },
    });
    if (!existing) throw new NotFoundError('Favorite not found');

    await prisma.favoriteBoard.delete({
      where: { userId_boardId: { userId, boardId } },
    });
    return { message: 'Removed from favorites' };
  }

  async isFavorite(userId: string, boardId: string) {
    const fav = await prisma.favoriteBoard.findUnique({
      where: { userId_boardId: { userId, boardId } },
    });
    return !!fav;
  }
}

export const favoriteService = new FavoriteService();
