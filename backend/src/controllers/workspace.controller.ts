import { Request, Response, NextFunction } from 'express';
import { workspaceService } from '../services/workspace.service';

class WorkspaceController {
  async getWorkspaces(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaces = await workspaceService.getUserWorkspaces(req.user!.userId);
      res.json({ success: true, data: workspaces });
    } catch (err) { next(err); }
  }

  async getWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const workspace = await workspaceService.getWorkspaceById(req.params.id, req.user!.userId);
      res.json({ success: true, data: workspace });
    } catch (err) { next(err); }
  }

  async createWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const workspace = await workspaceService.createWorkspace(req.body, req.user!.userId);
      res.status(201).json({ success: true, data: workspace });
    } catch (err) { next(err); }
  }

  async updateWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const workspace = await workspaceService.updateWorkspace(req.params.id, req.body, req.user!.userId);
      res.json({ success: true, data: workspace });
    } catch (err) { next(err); }
  }

  async deleteWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      await workspaceService.deleteWorkspace(req.params.id, req.user!.userId);
      res.json({ success: true, message: 'Workspace deleted' });
    } catch (err) { next(err); }
  }

  async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await workspaceService.addMember(
        req.params.id, req.body.userId, req.body.role || 'member', req.user!.userId
      );
      res.status(201).json({ success: true, data: member });
    } catch (err) { next(err); }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      await workspaceService.removeMember(req.params.id, req.params.userId, req.user!.userId);
      res.json({ success: true, message: 'Member removed' });
    } catch (err) { next(err); }
  }
}

export const workspaceController = new WorkspaceController();
