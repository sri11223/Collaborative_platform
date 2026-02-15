import { Request, Response, NextFunction } from 'express';
import { boardService } from '../services/board.service';
import { config } from '../config';

export class BoardController {
  async getBoards(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || config.pagination.defaultPage;
      const limit = Math.min(
        parseInt(req.query.limit as string) || config.pagination.defaultLimit,
        config.pagination.maxLimit
      );
      const search = req.query.search as string | undefined;

      const result = await boardService.getUserBoards(req.user!.userId, page, limit, search);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getBoard(req: Request, res: Response, next: NextFunction) {
    try {
      const board = await boardService.getBoardById(req.params.id, req.user!.userId);
      res.json({ success: true, data: board });
    } catch (error) {
      next(error);
    }
  }

  async createBoard(req: Request, res: Response, next: NextFunction) {
    try {
      const board = await boardService.createBoard(req.body, req.user!.userId);
      const io = req.app.get('io');
      io.emit('board:created', board);
      res.status(201).json({ success: true, data: board });
    } catch (error) {
      next(error);
    }
  }

  async updateBoard(req: Request, res: Response, next: NextFunction) {
    try {
      const board = await boardService.updateBoard(req.params.id, req.body, req.user!.userId);
      const io = req.app.get('io');
      io.to(`board:${req.params.id}`).emit('board:updated', board);
      res.json({ success: true, data: board });
    } catch (error) {
      next(error);
    }
  }

  async deleteBoard(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await boardService.deleteBoard(req.params.id, req.user!.userId);
      const io = req.app.get('io');
      io.to(`board:${req.params.id}`).emit('board:deleted', { boardId: req.params.id });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await boardService.removeMember(
        req.params.id,
        req.params.memberId,
        req.user!.userId
      );
      const io = req.app.get('io');
      io.to(`board:${req.params.id}`).emit('member:removed', {
        boardId: req.params.id,
        userId: req.params.memberId,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const boardController = new BoardController();
