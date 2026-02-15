import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';

export class NotificationController {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const unreadOnly = req.query.unreadOnly === 'true';
      const result = await notificationService.getUserNotifications(req.user!.userId, page, limit, unreadOnly);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await notificationService.getUnreadCount(req.user!.userId);
      res.json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAsRead(req.params.id, req.user!.userId);
      res.json({ success: true, data: { message: 'Notification marked as read' } });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.userId);
      res.json({ success: true, data: { message: 'All notifications marked as read' } });
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.deleteNotification(req.params.id, req.user!.userId);
      res.json({ success: true, data: { message: 'Notification deleted' } });
    } catch (error) {
      next(error);
    }
  }

  async clearAll(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.clearAll(req.user!.userId);
      res.json({ success: true, data: { message: 'All notifications cleared' } });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
