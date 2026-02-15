import { Request, Response, NextFunction } from 'express';
import { listService } from '../services/list.service';

export class ListController {
  async getLists(req: Request, res: Response, next: NextFunction) {
    try {
      const lists = await listService.getListsByBoard(req.params.boardId, req.user!.userId);
      res.json({ success: true, data: lists });
    } catch (error) {
      next(error);
    }
  }

  async createList(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await listService.createList(req.params.boardId, req.body.title, req.user!.userId);
      const io = req.app.get('io');
      io.to(`board:${req.params.boardId}`).emit('list:created', list);
      res.status(201).json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  async updateList(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await listService.updateList(req.params.id, req.body, req.user!.userId);
      const io = req.app.get('io');
      io.to(`board:${list.boardId}`).emit('list:updated', list);
      res.json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  async deleteList(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await listService.deleteList(req.params.id, req.user!.userId);
      const io = req.app.get('io');
      io.to(`board:${result.boardId}`).emit('list:deleted', { listId: req.params.id, boardId: result.boardId });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async reorderLists(req: Request, res: Response, next: NextFunction) {
    try {
      const lists = await listService.reorderLists(
        req.params.boardId,
        req.body.orders,
        req.user!.userId
      );
      const io = req.app.get('io');
      io.to(`board:${req.params.boardId}`).emit('lists:reordered', lists);
      res.json({ success: true, data: lists });
    } catch (error) {
      next(error);
    }
  }
}

export const listController = new ListController();
