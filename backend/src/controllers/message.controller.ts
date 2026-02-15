import { Request, Response, NextFunction } from 'express';
import { messageService } from '../services/message.service';

class MessageController {
  async getWorkspaceMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await messageService.getWorkspaceMembers(
        req.params.workspaceId,
        req.user!.userId
      );
      res.json({ success: true, data: members });
    } catch (err) { next(err); }
  }

  async getConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await messageService.getConversation(
        req.user!.userId,
        req.params.userId,
        page,
        limit
      );
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const message = await messageService.sendMessage(
        req.user!.userId,
        req.params.userId,
        req.body.content
      );

      // Emit real-time message via socket
      const io = req.app.get('io');
      io.to(`user:${req.params.userId}`).emit('dm:new', message);
      io.to(`user:${req.user!.userId}`).emit('dm:new', message);

      res.status(201).json({ success: true, data: message });
    } catch (err) { next(err); }
  }

  async deleteMessage(req: Request, res: Response, next: NextFunction) {
    try {
      await messageService.deleteMessage(req.params.messageId, req.user!.userId);

      const io = req.app.get('io');
      io.emit('dm:deleted', { messageId: req.params.messageId });

      res.json({ success: true, message: 'Message deleted' });
    } catch (err) { next(err); }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await messageService.getUnreadCount(req.user!.userId);
      res.json({ success: true, data: { count } });
    } catch (err) { next(err); }
  }
}

export const messageController = new MessageController();
