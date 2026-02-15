import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import { notificationService } from '../services/notification.service';

export class TaskController {
  async getMyTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await taskService.getMyTasks(req.user!.userId);
      res.json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  }

  async getTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.getTaskById(req.params.id, req.user!.userId);
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.createTask(req.params.listId, req.body, req.user!.userId);
      const io = req.app.get('io');
      const boardId = task.list?.boardId;
      if (boardId) {
        io.to(`board:${boardId}`).emit('task:created', task);
      }
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.updateTask(req.params.id, req.body, req.user!.userId);
      const io = req.app.get('io');
      const boardId = task.list?.boardId;
      if (boardId) {
        io.to(`board:${boardId}`).emit('task:updated', task);
      }
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await taskService.deleteTask(req.params.id, req.user!.userId);
      const io = req.app.get('io');
      io.to(`board:${result.boardId}`).emit('task:deleted', {
        taskId: req.params.id,
        listId: result.listId,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async moveTask(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await taskService.moveTask(req.params.id, req.body, req.user!.userId);
      const io = req.app.get('io');
      io.to(`board:${result.boardId}`).emit('task:moved', {
        task: result.task,
        fromListId: result.fromListId,
        toListId: result.toListId,
      });
      res.json({ success: true, data: result.task });
    } catch (error) {
      next(error);
    }
  }

  async addAssignee(req: Request, res: Response, next: NextFunction) {
    try {
      const assignee = await taskService.addAssignee(
        req.params.id,
        req.body.userId,
        req.user!.userId
      );
      const task = await taskService.getTaskById(req.params.id, req.user!.userId);
      const io = req.app.get('io');
      const boardId = task.list?.boardId;
      if (boardId) {
        io.to(`board:${boardId}`).emit('task:updated', task);
      }
      // Send real-time notification to the assigned user
      if (req.body.userId !== req.user!.userId) {
        const notification = await notificationService.notifyTaskAssigned(
          task.title,
          req.user!.userId, // Will be resolved to name in service
          req.body.userId,
          boardId || '',
          task.id
        );
        io.to(`user:${req.body.userId}`).emit('notification:new', notification);
      }
      res.status(201).json({ success: true, data: assignee });
    } catch (error) {
      next(error);
    }
  }

  async removeAssignee(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await taskService.removeAssignee(
        req.params.id,
        req.params.userId,
        req.user!.userId
      );
      const task = await taskService.getTaskById(req.params.id, req.user!.userId);
      const io = req.app.get('io');
      const boardId = task.list?.boardId;
      if (boardId) {
        io.to(`board:${boardId}`).emit('task:updated', task);
      }
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async addLabel(req: Request, res: Response, next: NextFunction) {
    try {
      const taskLabel = await taskService.addLabel(req.params.id, req.body.labelId, req.user!.userId);
      const task = await taskService.getTaskById(req.params.id, req.user!.userId);
      const io = req.app.get('io');
      const boardId = task.list?.boardId;
      if (boardId) {
        io.to(`board:${boardId}`).emit('task:updated', task);
      }
      res.status(201).json({ success: true, data: taskLabel });
    } catch (error) {
      next(error);
    }
  }

  async removeLabel(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await taskService.removeLabel(req.params.id, req.params.labelId, req.user!.userId);
      const task = await taskService.getTaskById(req.params.id, req.user!.userId);
      const io = req.app.get('io');
      const boardId = task.list?.boardId;
      if (boardId) {
        io.to(`board:${boardId}`).emit('task:updated', task);
      }
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await taskService.addComment(req.params.id, req.body.content, req.user!.userId);
      const io = req.app.get('io');
      io.to(`board:${result.boardId}`).emit('comment:created', {
        taskId: req.params.id,
        comment: result.comment,
      });
      // Notify task assignees about the new comment
      const task = await taskService.getTaskById(req.params.id, req.user!.userId);
      if (task.assignees) {
        for (const assignee of task.assignees) {
          if (assignee.userId !== req.user!.userId) {
            const notification = await notificationService.notifyCommentAdded(
              task.title,
              result.comment.user?.name || 'Someone',
              assignee.userId,
              result.boardId,
              task.id
            );
            io.to(`user:${assignee.userId}`).emit('notification:new', notification);
          }
        }
      }
      res.status(201).json({ success: true, data: result.comment });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await taskService.deleteComment(req.params.commentId, req.user!.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async searchTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await taskService.searchTasks(
        req.params.boardId,
        req.query.q as string || '',
        req.user!.userId
      );
      res.json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
