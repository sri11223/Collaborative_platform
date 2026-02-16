import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';

export class AiController {
  async generateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId, description } = req.body;
      const board = await aiService.generateProject(req.user!.userId, workspaceId, description);
      res.status(201).json({ success: true, data: board });
    } catch (error) {
      next(error);
    }
  }

  async createBugReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { boardId, description } = req.body;
      const result = await aiService.createBugReport(req.user!.userId, boardId, description);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async breakdownTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { boardId, listId, parentTitle, description } = req.body;
      const result = await aiService.breakdownTask(req.user!.userId, boardId, listId, parentTitle, description);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async analyzeWorkload(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      const result = await aiService.analyzeWorkload(req.user!.userId, workspaceId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async generateStandup(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      const result = await aiService.generateStandup(req.user!.userId, workspaceId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async planSprint(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      const sprintDays = parseInt(req.query.days as string) || 14;
      const result = await aiService.planSprint(req.user!.userId, workspaceId, sprintDays);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AiController();
