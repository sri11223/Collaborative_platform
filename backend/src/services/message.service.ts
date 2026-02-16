import { prisma } from '../lib/prisma';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class MessageService {
  // Get workspace members for DM list
  async getWorkspaceMembers(workspaceId: string, userId: string) {
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    // Get last message and unread count for each member
    const membersWithChat = await Promise.all(
      members
        .filter((m) => m.userId !== userId)
        .map(async (m) => {
          const lastMessage = await prisma.directMessage.findFirst({
            where: {
              OR: [
                { senderId: userId, receiverId: m.userId },
                { senderId: m.userId, receiverId: userId },
              ],
            },
            orderBy: { createdAt: 'desc' },
          });

          const unreadCount = await prisma.directMessage.count({
            where: {
              senderId: m.userId,
              receiverId: userId,
              read: false,
            },
          });

          return {
            ...m,
            lastMessage,
            unreadCount,
          };
        })
    );

    return membersWithChat;
  }

  // Get conversation between two users
  async getConversation(userId: string, otherUserId: string, page = 1, limit = 50) {
    const [messages, total] = await Promise.all([
      prisma.directMessage.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        },
        include: {
          sender: { select: { id: true, name: true, email: true, avatar: true } },
          receiver: { select: { id: true, name: true, email: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.directMessage.count({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        },
      }),
    ]);

    // Mark received messages as read
    await prisma.directMessage.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        read: false,
      },
      data: { read: true },
    });

    return {
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Send a direct message
  async sendMessage(senderId: string, receiverId: string, content: string) {
    // Verify receiver exists
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) throw new NotFoundError('User not found');

    const message = await prisma.directMessage.create({
      data: {
        content,
        senderId,
        receiverId,
      },
      include: {
        sender: { select: { id: true, name: true, email: true, avatar: true } },
        receiver: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    return message;
  }

  // Delete a message (only sender can delete)
  async deleteMessage(messageId: string, userId: string) {
    const message = await prisma.directMessage.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundError('Message not found');
    if (message.senderId !== userId) throw new ForbiddenError('You can only delete your own messages');

    await prisma.directMessage.delete({ where: { id: messageId } });
    return { message: 'Message deleted' };
  }

  // Get total unread DM count for a user
  async getUnreadCount(userId: string) {
    const count = await prisma.directMessage.count({
      where: { receiverId: userId, read: false },
    });
    return count;
  }
}

export const messageService = new MessageService();
