import { prisma } from '../lib/prisma';

export class ActivityService {
  async log(data: {
    type: string;
    description: string;
    boardId: string;
    userId: string;
    taskId?: string;
    metadata?: string;
  }) {
    const activity = await prisma.activity.create({
      data: {
        type: data.type,
        description: data.description,
        boardId: data.boardId,
        userId: data.userId,
        taskId: data.taskId,
        metadata: data.metadata,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
    return activity;
  }

  async getBoardActivities(boardId: string, page: number, limit: number) {
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: { boardId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          task: { select: { id: true, title: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activity.count({ where: { boardId } }),
    ]);

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const activityService = new ActivityService();
