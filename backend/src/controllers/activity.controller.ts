import { Request, Response, NextFunction } from 'express';
import { activityService } from '../services/activity.service';
import { boardService } from '../services/board.service';
import { config } from '../config';

export class ActivityController {
  async getBoardActivities(req: Request, res: Response, next: NextFunction) {
    try {
      await boardService.verifyBoardAccess(req.params.boardId, req.user!.userId);
      const page = parseInt(req.query.page as string) || config.pagination.defaultPage;
      const limit = Math.min(
        parseInt(req.query.limit as string) || config.pagination.defaultLimit,
        config.pagination.maxLimit
      );

      const result = await activityService.getBoardActivities(req.params.boardId, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const activityController = new ActivityController();
