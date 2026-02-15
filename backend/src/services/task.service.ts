import { prisma } from '../index';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { boardService } from './board.service';
import { activityService } from './activity.service';

export class TaskService {
  private taskInclude = {
    assignees: {
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    },
    labels: { include: { label: true } },
    _count: { select: { comments: true } },
    list: { select: { id: true, title: true, boardId: true } },
  };

  async getTaskById(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        ...this.taskInclude,
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
      },
    });
    if (!task) throw new NotFoundError('Task not found');
    await boardService.verifyBoardAccess(task.list.boardId, userId);
    return task;
  }

  async createTask(
    listId: string,
    data: { title: string; description?: string; priority?: string; dueDate?: string },
    userId: string
  ) {
    const list = await prisma.list.findUnique({ where: { id: listId }, include: { board: true } });
    if (!list) throw new NotFoundError('List not found');
    await boardService.verifyBoardAccess(list.boardId, userId);

    const maxPosition = await prisma.task.findFirst({
      where: { listId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || 'medium',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        listId,
        position: (maxPosition?.position ?? -1) + 1,
      },
      include: this.taskInclude,
    });

    await activityService.log({
      type: 'task_created',
      description: `created task "${data.title}" in ${list.title}`,
      boardId: list.boardId,
      userId,
      taskId: task.id,
    });

    return task;
  }

  async updateTask(
    taskId: string,
    data: { title?: string; description?: string; priority?: string; dueDate?: string | null },
    userId: string
  ) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { list: true },
    });
    if (!task) throw new NotFoundError('Task not found');
    await boardService.verifyBoardAccess(task.list.boardId, userId);

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: this.taskInclude,
    });

    await activityService.log({
      type: 'task_updated',
      description: `updated task "${updated.title}"`,
      boardId: task.list.boardId,
      userId,
      taskId,
    });

    return updated;
  }

  async deleteTask(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { list: true },
    });
    if (!task) throw new NotFoundError('Task not found');
    await boardService.verifyBoardAccess(task.list.boardId, userId);

    await prisma.task.delete({ where: { id: taskId } });

    // Reorder remaining tasks
    const remaining = await prisma.task.findMany({
      where: { listId: task.listId },
      orderBy: { position: 'asc' },
    });
    for (let i = 0; i < remaining.length; i++) {
      await prisma.task.update({
        where: { id: remaining[i].id },
        data: { position: i },
      });
    }

    await activityService.log({
      type: 'task_deleted',
      description: `deleted task "${task.title}"`,
      boardId: task.list.boardId,
      userId,
    });

    return { message: 'Task deleted', listId: task.listId, boardId: task.list.boardId };
  }

  async moveTask(
    taskId: string,
    data: { toListId: string; position: number },
    userId: string
  ) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { list: true },
    });
    if (!task) throw new NotFoundError('Task not found');
    await boardService.verifyBoardAccess(task.list.boardId, userId);

    const targetList = await prisma.list.findUnique({ where: { id: data.toListId } });
    if (!targetList) throw new NotFoundError('Target list not found');

    const fromListId = task.listId;

    // Move the task
    await prisma.task.update({
      where: { id: taskId },
      data: { listId: data.toListId, position: data.position },
    });

    // Reorder source list
    if (fromListId !== data.toListId) {
      const sourceTasks = await prisma.task.findMany({
        where: { listId: fromListId },
        orderBy: { position: 'asc' },
      });
      for (let i = 0; i < sourceTasks.length; i++) {
        await prisma.task.update({
          where: { id: sourceTasks[i].id },
          data: { position: i },
        });
      }
    }

    // Reorder target list
    const targetTasks = await prisma.task.findMany({
      where: { listId: data.toListId, id: { not: taskId } },
      orderBy: { position: 'asc' },
    });

    let newPos = 0;
    for (let i = 0; i < targetTasks.length; i++) {
      if (newPos === data.position) newPos++;
      await prisma.task.update({
        where: { id: targetTasks[i].id },
        data: { position: newPos },
      });
      newPos++;
    }

    await prisma.task.update({
      where: { id: taskId },
      data: { position: data.position },
    });

    if (fromListId !== data.toListId) {
      await activityService.log({
        type: 'task_moved',
        description: `moved task "${task.title}" from "${task.list.title}" to "${targetList.title}"`,
        boardId: task.list.boardId,
        userId,
        taskId,
        metadata: JSON.stringify({ fromListId, toListId: data.toListId }),
      });
    }

    const updated = await prisma.task.findUnique({
      where: { id: taskId },
      include: this.taskInclude,
    });

    return { task: updated, fromListId, toListId: data.toListId, boardId: task.list.boardId };
  }

  async addAssignee(taskId: string, assigneeUserId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { list: true },
    });
    if (!task) throw new NotFoundError('Task not found');
    await boardService.verifyBoardAccess(task.list.boardId, userId);

    // Verify assignee has access to the board
    await boardService.verifyBoardAccess(task.list.boardId, assigneeUserId);

    const assignee = await prisma.taskAssignee.create({
      data: { taskId, userId: assigneeUserId },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    const assignedUser = await prisma.user.findUnique({
      where: { id: assigneeUserId },
      select: { name: true },
    });

    await activityService.log({
      type: 'task_assignee_added',
      description: `assigned ${assignedUser?.name} to task "${task.title}"`,
      boardId: task.list.boardId,
      userId,
      taskId,
    });

    return assignee;
  }

  async removeAssignee(taskId: string, assigneeUserId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { list: true },
    });
    if (!task) throw new NotFoundError('Task not found');
    await boardService.verifyBoardAccess(task.list.boardId, userId);

    await prisma.taskAssignee.deleteMany({
      where: { taskId, userId: assigneeUserId },
    });

    return { message: 'Assignee removed' };
  }

  async addLabel(taskId: string, labelId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { list: true },
    });
    if (!task) throw new NotFoundError('Task not found');
    await boardService.verifyBoardAccess(task.list.boardId, userId);

    const taskLabel = await prisma.taskLabel.create({
      data: { taskId, labelId },
      include: { label: true },
    });
    return taskLabel;
  }

  async removeLabel(taskId: string, labelId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { list: true },
    });
    if (!task) throw new NotFoundError('Task not found');
    await boardService.verifyBoardAccess(task.list.boardId, userId);

    await prisma.taskLabel.deleteMany({
      where: { taskId, labelId },
    });
    return { message: 'Label removed' };
  }

  async addComment(taskId: string, content: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { list: true },
    });
    if (!task) throw new NotFoundError('Task not found');
    await boardService.verifyBoardAccess(task.list.boardId, userId);

    const comment = await prisma.comment.create({
      data: { content, taskId, userId },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    await activityService.log({
      type: 'comment_added',
      description: `commented on task "${task.title}"`,
      boardId: task.list.boardId,
      userId,
      taskId,
    });

    return { comment, boardId: task.list.boardId };
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { task: { include: { list: true } } },
    });
    if (!comment) throw new NotFoundError('Comment not found');
    if (comment.userId !== userId) {
      throw new BadRequestError('You can only delete your own comments');
    }

    await prisma.comment.delete({ where: { id: commentId } });
    return { message: 'Comment deleted' };
  }

  async searchTasks(boardId: string, query: string, userId: string) {
    await boardService.verifyBoardAccess(boardId, userId);

    const tasks = await prisma.task.findMany({
      where: {
        list: { boardId },
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      },
      include: this.taskInclude,
      take: 20,
    });
    return tasks;
  }
}

export const taskService = new TaskService();
