import { Request, Response, NextFunction } from 'express';
import { labelService } from '../services/label.service';

export class LabelController {
  async getLabels(req: Request, res: Response, next: NextFunction) {
    try {
      const labels = await labelService.getBoardLabels(req.params.boardId, req.user!.userId);
      res.json({ success: true, data: labels });
    } catch (error) {
      next(error);
    }
  }

  async createLabel(req: Request, res: Response, next: NextFunction) {
    try {
      const label = await labelService.createLabel(req.params.boardId, req.body, req.user!.userId);
      res.status(201).json({ success: true, data: label });
    } catch (error) {
      next(error);
    }
  }

  async updateLabel(req: Request, res: Response, next: NextFunction) {
    try {
      const label = await labelService.updateLabel(req.params.id, req.body, req.user!.userId);
      res.json({ success: true, data: label });
    } catch (error) {
      next(error);
    }
  }

  async deleteLabel(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await labelService.deleteLabel(req.params.id, req.user!.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const labelController = new LabelController();
