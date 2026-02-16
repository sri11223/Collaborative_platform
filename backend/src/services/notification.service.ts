import { prisma } from '../lib/prisma';
import { sendEmail, buildTaskAssignedEmail, buildCommentEmail, buildNotificationEmail } from '../utils/email';
import { config } from '../config';

export class NotificationService {
  async createNotification(data: {
    type: string;
    title: string;
    message: string;
    userId: string;
    boardId?: string;
    taskId?: string;
    metadata?: Record<string, any>;
  }) {
    const notification = await prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        userId: data.userId,
        boardId: data.boardId || null,
        taskId: data.taskId || null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });
    return notification;
  }

  async getUserNotifications(userId: string, page: number = 1, limit: number = 20, unreadOnly: boolean = false) {
    const where: any = { userId };
    if (unreadOnly) where.read = false;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, read: false } });
  }

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    return prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }

  async clearAll(userId: string) {
    return prisma.notification.deleteMany({
      where: { userId },
    });
  }

  // ─── Notification Helpers ─────────────────────────────

  async notifyTaskAssigned(taskTitle: string, assignerName: string, assigneeId: string, boardId: string, taskId: string) {
    const notification = await this.createNotification({
      type: 'task_assigned',
      title: 'New Task Assignment',
      message: `${assignerName} assigned you to "${taskTitle}"`,
      userId: assigneeId,
      boardId,
      taskId,
    });

    // Send email
    try {
      const user = await prisma.user.findUnique({ where: { id: assigneeId }, select: { email: true, name: true } });
      const board = await prisma.board.findUnique({ where: { id: boardId }, select: { title: true } });
      if (user && board) {
        const taskLink = `${config.clientUrl}/board/${boardId}?task=${taskId}`;
        const emailContent = buildTaskAssignedEmail({
          assigneeName: user.name,
          taskTitle,
          assignerName,
          boardTitle: board.title,
          taskLink,
        });
        await sendEmail({ to: user.email, subject: emailContent.subject, html: emailContent.html });
      }
    } catch (err) {
      console.error('Task assignment email failed:', err);
    }

    return notification;
  }

  async notifyCommentAdded(taskTitle: string, commenterName: string, recipientId: string, boardId: string, taskId: string) {
    const notification = await this.createNotification({
      type: 'comment_added',
      title: 'New Comment',
      message: `${commenterName} commented on "${taskTitle}"`,
      userId: recipientId,
      boardId,
      taskId,
    });

    // Send email
    try {
      const user = await prisma.user.findUnique({ where: { id: recipientId }, select: { email: true, name: true } });
      if (user) {
        const taskLink = `${config.clientUrl}/board/${boardId}?task=${taskId}`;
        const emailContent = buildCommentEmail({
          recipientName: user.name,
          commenterName,
          taskTitle,
          commentPreview: `${commenterName} left a comment`,
          taskLink,
        });
        await sendEmail({ to: user.email, subject: emailContent.subject, html: emailContent.html });
      }
    } catch (err) {
      console.error('Comment email failed:', err);
    }

    return notification;
  }

  async notifyInvitation(boardTitle: string, inviterName: string, inviteeId: string, boardId: string) {
    return this.createNotification({
      type: 'invitation_received',
      title: 'Board Invitation',
      message: `${inviterName} invited you to "${boardTitle}"`,
      userId: inviteeId,
      boardId,
    });
  }

  async notifyBoardUpdate(message: string, recipientId: string, boardId: string) {
    return this.createNotification({
      type: 'board_update',
      title: 'Board Update',
      message,
      userId: recipientId,
      boardId,
    });
  }
}

export const notificationService = new NotificationService();
