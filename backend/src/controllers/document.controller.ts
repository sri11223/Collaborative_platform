import { Request, Response, NextFunction } from 'express';
import { documentService } from '../services/document.service';

export class DocumentController {
  async getDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const docs = await documentService.getWorkspaceDocuments(req.params.workspaceId, req.user!.userId);
      res.json({ success: true, data: docs });
    } catch (error) {
      next(error);
    }
  }

  async getDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await documentService.getDocumentById(req.params.id, req.user!.userId);
      res.json({ success: true, data: doc });
    } catch (error) {
      next(error);
    }
  }

  async createDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await documentService.createDocument(
        { ...req.body, workspaceId: req.params.workspaceId },
        req.user!.userId
      );
      res.status(201).json({ success: true, data: doc });
    } catch (error) {
      next(error);
    }
  }

  async updateDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await documentService.updateDocument(req.params.id, req.body, req.user!.userId);
      res.json({ success: true, data: doc });
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await documentService.deleteDocument(req.params.id, req.user!.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const documentController = new DocumentController();
