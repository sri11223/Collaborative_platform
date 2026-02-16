import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { config } from '../config';

const router = Router();

/**
 * @swagger
 * /api/seed:
 *   post:
 *     summary: Seed database with demo data (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               secret:
 *                 type: string
 *                 description: Admin secret key (JWT_SECRET)
 *     responses:
 *       200:
 *         description: Database seeded successfully
 *       401:
 *         description: Unauthorized - Invalid secret
 */
router.post('/seed', async (req: Request, res: Response) => {
  try {
    const { secret } = req.body;

    // Verify admin secret (using JWT_SECRET as seed secret)
    if (!secret || secret !== config.jwtSecret) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized: Invalid secret key' },
      });
    }

    console.log('🌱 Starting database seeding via API...');

    // Clear existing data
    await prisma.notification.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.taskAssignee.deleteMany();
    await prisma.taskLabel.deleteMany();
    await prisma.task.deleteMany();
    await prisma.list.deleteMany();
    await prisma.label.deleteMany();
    await prisma.boardMember.deleteMany();
    await prisma.invitation.deleteMany();
    await prisma.favoriteBoard.deleteMany();
    await prisma.board.deleteMany();
    await prisma.workspaceMember.deleteMany();
    await prisma.workspace.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    const hashedPassword = await bcrypt.hash('Demo123!', 10);

    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'sarah.johnson@taskflow.demo',
          name: 'Sarah Johnson',
          password: hashedPassword,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        },
      }),
      prisma.user.create({
        data: {
          email: 'mike.chen@taskflow.demo',
          name: 'Mike Chen',
          password: hashedPassword,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
        },
      }),
      prisma.user.create({
        data: {
          email: 'emily.rodriguez@taskflow.demo',
          name: 'Emily Rodriguez',
          password: hashedPassword,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
        },
      }),
      prisma.user.create({
        data: {
          email: 'alex.kumar@taskflow.demo',
          name: 'Alex Kumar',
          password: hashedPassword,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        },
      }),
      prisma.user.create({
        data: {
          email: 'lisa.martinez@taskflow.demo',
          name: 'Lisa Martinez',
          password: hashedPassword,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
        },
      }),
    ]);

    // Create workspaces
    const workspace1 = await prisma.workspace.create({
      data: {
        name: 'Acme Corporation',
        color: '#6366f1',
        ownerId: users[0].id,
      },
    });

    const workspace2 = await prisma.workspace.create({
      data: {
        name: 'Marketing Team',
        color: '#ec4899',
        ownerId: users[1].id,
      },
    });

    const workspace3 = await prisma.workspace.create({
      data: {
        name: 'Side Projects',
        color: '#10b981',
        ownerId: users[2].id,
      },
    });

    // Create boards
    const board1 = await prisma.board.create({
      data: {
        title: 'Product Roadmap Q1 2026',
        description: 'First quarter product development and feature releases',
        color: '#3b82f6',
        workspaceId: workspace1.id,
        ownerId: users[0].id,
      },
    });

    const board2 = await prisma.board.create({
      data: {
        title: 'Website Redesign',
        description: 'Complete overhaul of company website with new branding',
        color: '#8b5cf6',
        workspaceId: workspace1.id,
        ownerId: users[0].id,
      },
    });

    const board3 = await prisma.board.create({
      data: {
        title: 'Q1 Marketing Campaigns',
        description: 'Campaign planning and execution for Q1',
        color: '#f59e0b',
        workspaceId: workspace2.id,
        ownerId: users[1].id,
      },
    });

    const board4 = await prisma.board.create({
      data: {
        title: 'Content Calendar',
        description: 'Blog posts, social media, and newsletter schedule',
        color: '#ef4444',
        workspaceId: workspace2.id,
        ownerId: users[1].id,
      },
    });

    const board5 = await prisma.board.create({
      data: {
        title: 'Mobile App Development',
        description: 'iOS and Android app development sprint board',
        color: '#06b6d4',
        workspaceId: workspace3.id,
        ownerId: users[2].id,
      },
    });

    const boards = [board1, board2, board3, board4, board5];

    // Add board members
    const boardMembers = await Promise.all([
      prisma.boardMember.create({
        data: { boardId: board1.id, userId: users[0].id, role: 'admin' },
      }),
      prisma.boardMember.create({
        data: { boardId: board1.id, userId: users[1].id, role: 'member' },
      }),
      prisma.boardMember.create({
        data: { boardId: board1.id, userId: users[3].id, role: 'member' },
      }),
      prisma.boardMember.create({
        data: { boardId: board2.id, userId: users[0].id, role: 'admin' },
      }),
      prisma.boardMember.create({
        data: { boardId: board2.id, userId: users[2].id, role: 'member' },
      }),
      prisma.boardMember.create({
        data: { boardId: board3.id, userId: users[1].id, role: 'admin' },
      }),
      prisma.boardMember.create({
        data: { boardId: board3.id, userId: users[4].id, role: 'member' },
      }),
      prisma.boardMember.create({
        data: { boardId: board4.id, userId: users[1].id, role: 'admin' },
      }),
      prisma.boardMember.create({
        data: { boardId: board4.id, userId: users[4].id, role: 'member' },
      }),
      prisma.boardMember.create({
        data: { boardId: board5.id, userId: users[2].id, role: 'admin' },
      }),
      prisma.boardMember.create({
        data: { boardId: board5.id, userId: users[3].id, role: 'member' },
      }),
    ]);

    // Add favorites
    await Promise.all([
      prisma.favoriteBoard.create({ data: { userId: users[0].id, boardId: board1.id } }),
      prisma.favoriteBoard.create({ data: { userId: users[1].id, boardId: board3.id } }),
      prisma.favoriteBoard.create({ data: { userId: users[2].id, boardId: board5.id } }),
    ]);

    // Create lists for Board 1
    const list1_todo = await prisma.list.create({
      data: { title: 'To Do', position: 0, boardId: board1.id },
    });
    const list1_progress = await prisma.list.create({
      data: { title: 'In Progress', position: 1, boardId: board1.id },
    });
    const list1_done = await prisma.list.create({
      data: { title: 'Done', position: 2, boardId: board1.id },
    });

    // Create lists for Board 2
    const list2_todo = await prisma.list.create({
      data: { title: 'Backlog', position: 0, boardId: board2.id },
    });
    const list2_progress = await prisma.list.create({
      data: { title: 'Working On', position: 1, boardId: board2.id },
    });

    // Create labels
    const label_feature = await prisma.label.create({
      data: { name: 'Feature', color: '#3b82f6', boardId: board1.id },
    });
    const label_bug = await prisma.label.create({
      data: { name: 'Bug', color: '#ef4444', boardId: board1.id },
    });
    const label_urgent = await prisma.label.create({
      data: { name: 'Urgent', color: '#f59e0b', boardId: board1.id },
    });

    // Create sample tasks
    const task1 = await prisma.task.create({
      data: {
        title: 'Design new user authentication flow',
        description: 'Implement OAuth 2.0 and social login options (Google, GitHub)',
        priority: 'high',
        dueDate: new Date('2026-03-15'),
        listId: list1_progress.id,
        position: 0,
      },
    });

    const task2 = await prisma.task.create({
      data: {
        title: 'Implement real-time collaboration',
        description: 'Add WebSocket support for live updates and presence',
        priority: 'high',
        listId: list1_todo.id,
        position: 0,
      },
    });

    const task3 = await prisma.task.create({
      data: {
        title: 'Database optimization',
        description: 'Analyze and optimize slow queries, add indexes',
        priority: 'medium',
        listId: list1_progress.id,
        position: 1,
      },
    });

    const task4 = await prisma.task.create({
      data: {
        title: 'Mobile responsive improvements',
        description: 'Fix layout issues on mobile devices',
        priority: 'medium',
        listId: list1_done.id,
        position: 0,
      },
    });

    const task5 = await prisma.task.create({
      data: {
        title: 'Create brand identity guidelines',
        description: 'Define color palette, typography, and design system',
        priority: 'high',
        dueDate: new Date('2026-02-25'),
        listId: list2_progress.id,
        position: 0,
      },
    });

    const tasks = [task1, task2, task3, task4, task5];

    // Assign labels to tasks
    await Promise.all([
      prisma.taskLabel.create({ data: { taskId: task1.id, labelId: label_feature.id } }),
      prisma.taskLabel.create({ data: { taskId: task1.id, labelId: label_urgent.id } }),
      prisma.taskLabel.create({ data: { taskId: task2.id, labelId: label_feature.id } }),
      prisma.taskLabel.create({ data: { taskId: task3.id, labelId: label_bug.id } }),
    ]);

    // Assign tasks
    await Promise.all([
      prisma.taskAssignee.create({ data: { taskId: task1.id, userId: users[1].id } }),
      prisma.taskAssignee.create({ data: { taskId: task2.id, userId: users[3].id } }),
      prisma.taskAssignee.create({ data: { taskId: task3.id, userId: users[0].id } }),
      prisma.taskAssignee.create({ data: { taskId: task5.id, userId: users[2].id } }),
    ]);

    // Create comments
    await Promise.all([
      prisma.comment.create({
        data: {
          content: 'Started working on OAuth integration with Passport.js',
          taskId: task1.id,
          userId: users[1].id,
        },
      }),
      prisma.comment.create({
        data: {
          content: 'Great progress! Make sure to handle edge cases for account linking.',
          taskId: task1.id,
          userId: users[0].id,
        },
      }),
      prisma.comment.create({
        data: {
          content: 'Should we use Socket.IO or raw WebSockets? Socket.IO has better fallback support.',
          taskId: task2.id,
          userId: users[3].id,
        },
      }),
    ]);

    // Create notifications
    await Promise.all([
      prisma.notification.create({
        data: {
          userId: users[1].id,
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: 'You were assigned to "Design new user authentication flow"',
          read: false,
          boardId: board1.id,
          taskId: task1.id,
        },
      }),
      prisma.notification.create({
        data: {
          userId: users[3].id,
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: 'You were assigned to "Implement real-time collaboration"',
          read: false,
          boardId: board1.id,
          taskId: task2.id,
        },
      }),
      prisma.notification.create({
        data: {
          userId: users[0].id,
          type: 'comment_added',
          title: 'New Comment',
          message: 'Mike Chen commented on a task',
          read: true,
          boardId: board1.id,
          taskId: task1.id,
        },
      }),
    ]);

    // Create activity logs
    await Promise.all([
      prisma.activity.create({
        data: {
          type: 'board_created',
          description: 'created board "Product Roadmap Q1 2026"',
          boardId: board1.id,
          userId: users[0].id,
        },
      }),
      prisma.activity.create({
        data: {
          type: 'task_created',
          description: 'added task "Design new user authentication flow"',
          boardId: board1.id,
          userId: users[1].id,
          taskId: task1.id,
        },
      }),
      prisma.activity.create({
        data: {
          type: 'task_assigned',
          description: 'assigned task to Mike Chen',
          boardId: board1.id,
          userId: users[0].id,
          taskId: task1.id,
        },
      }),
    ]);

    console.log('✅ Database seeded successfully via API!');

    res.json({
      success: true,
      data: {
        message: 'Database seeded successfully',
        stats: {
          users: users.length,
          workspaces: 3,
          boards: boards.length,
          lists: 5,
          tasks: tasks.length,
          boardMembers: boardMembers.length,
          labels: 3,
          comments: 3,
          notifications: 3,
        },
        demoCredentials: {
          email: '[user]@taskflow.demo',
          password: 'Demo123!',
          availableUsers: users.map((u) => u.email),
        },
      },
    });
  } catch (error) {
    console.error('❌ Seed error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to seed database', details: error instanceof Error ? error.message : 'Unknown error' },
    });
  }
});

export default router;
