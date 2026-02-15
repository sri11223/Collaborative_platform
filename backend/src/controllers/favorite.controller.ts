import { Request, Response, NextFunction } from 'express';
import { favoriteService } from '../services/favorite.service';

class FavoriteController {
  async getFavorites(req: Request, res: Response, next: NextFunction) {
    try {
      const favorites = await favoriteService.getUserFavorites(req.user!.userId);
      res.json({ success: true, data: favorites });
    } catch (err) { next(err); }
  }

  async addFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      const favorite = await favoriteService.addFavorite(
        req.user!.userId,
        req.params.boardId
      );
      res.status(201).json({ success: true, data: favorite });
    } catch (err) { next(err); }
  }

  async removeFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      await favoriteService.removeFavorite(
        req.user!.userId,
        req.params.boardId
      );
      res.json({ success: true, message: 'Removed from favorites' });
    } catch (err) { next(err); }
  }
}

export const favoriteController = new FavoriteController();
