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
    await prisma.boardActivity.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.taskAssignment.deleteMany();
    await prisma.task.deleteMany();
    await prisma.boardMember.deleteMany();
    await prisma.invitation.deleteMany();
    await prisma.board.deleteMany();
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
        description: 'Main company workspace for product development and operations',
        ownerId: users[0].id,
      },
    });

    const workspace2 = await prisma.workspace.create({
      data: {
        name: 'Marketing Team',
        description: 'Content creation, campaigns, and social media management',
        ownerId: users[1].id,
      },
    });

    const workspace3 = await prisma.workspace.create({
      data: {
        name: 'Side Projects',
        description: 'Personal projects and experiments',
        ownerId: users[2].id,
      },
    });

    // Create boards
    const boards = await Promise.all([
      prisma.board.create({
        data: {
          name: 'Product Roadmap Q1 2026',
          description: 'First quarter product development and feature releases',
          workspaceId: workspace1.id,
          isFavorite: true,
        },
      }),
      prisma.board.create({
        data: {
          name: 'Website Redesign',
          description: 'Complete overhaul of company website with new branding',
          workspaceId: workspace1.id,
        },
      }),
      prisma.board.create({
        data: {
          name: 'Q1 Marketing Campaigns',
          description: 'Campaign planning and execution for Q1',
          workspaceId: workspace2.id,
          isFavorite: true,
        },
      }),
      prisma.board.create({
        data: {
          name: 'Content Calendar',
          description: 'Blog posts, social media, and newsletter schedule',
          workspaceId: workspace2.id,
        },
      }),
      prisma.board.create({
        data: {
          name: 'Mobile App Development',
          description: 'iOS and Android app development sprint board',
          workspaceId: workspace3.id,
          isFavorite: true,
        },
      }),
    ]);

    // Add board members
    const boardMembers = [];
    boardMembers.push(
      await prisma.boardMember.create({
        data: { boardId: boards[0].id, userId: users[0].id, role: 'admin' },
      }),
      await prisma.boardMember.create({
        data: { boardId: boards[0].id, userId: users[1].id, role: 'member' },
      }),
      await prisma.boardMember.create({
        data: { boardId: boards[0].id, userId: users[3].id, role: 'member' },
      }),
      await prisma.boardMember.create({
        data: { boardId: boards[1].id, userId: users[0].id, role: 'admin' },
      }),
      await prisma.boardMember.create({
        data: { boardId: boards[1].id, userId: users[2].id, role: 'member' },
      }),
      await prisma.boardMember.create({
        data: { boardId: boards[2].id, userId: users[1].id, role: 'admin' },
      }),
      await prisma.boardMember.create({
        data: { boardId: boards[2].id, userId: users[4].id, role: 'member' },
      }),
      await prisma.boardMember.create({
        data: { boardId: boards[3].id, userId: users[1].id, role: 'admin' },
      }),
      await prisma.boardMember.create({
        data: { boardId: boards[3].id, userId: users[4].id, role: 'member' },
      }),
      await prisma.boardMember.create({
        data: { boardId: boards[4].id, userId: users[2].id, role: 'admin' },
      }),
      await prisma.boardMember.create({
        data: { boardId: boards[4].id, userId: users[3].id, role: 'member' },
      })
    );

    // Create sample tasks
    const tasks = await Promise.all([
      prisma.task.create({
        data: {
          title: 'Design new user authentication flow',
          description: 'Implement OAuth 2.0 and social login options',
          status: 'in-progress',
          priority: 'high',
          dueDate: new Date('2026-03-15'),
          boardId: boards[0].id,
          position: 0,
          labels: ['feature', 'security'],
        },
      }),
      prisma.task.create({
        data: {
          title: 'Implement real-time collaboration',
          description: 'Add WebSocket support for live updates',
          status: 'todo',
          priority: 'high',
          boardId: boards[0].id,
          position: 1,
          labels: ['feature', 'backend'],
        },
      }),
      prisma.task.create({
        data: {
          title: 'Database optimization',
          description: 'Analyze and optimize slow queries',
          status: 'in-progress',
          priority: 'medium',
          boardId: boards[0].id,
          position: 2,
          labels: ['performance'],
        },
      }),
      prisma.task.create({
        data: {
          title: 'Mobile responsive improvements',
          description: 'Fix layout issues on mobile devices',
          status: 'done',
          priority: 'medium',
          boardId: boards[0].id,
          position: 3,
          labels: ['ui', 'mobile'],
        },
      }),
    ]);

    // Assign tasks
    await Promise.all([
      prisma.taskAssignment.create({ data: { taskId: tasks[0].id, userId: users[1].id } }),
      prisma.taskAssignment.create({ data: { taskId: tasks[1].id, userId: users[3].id } }),
      prisma.taskAssignment.create({ data: { taskId: tasks[2].id, userId: users[0].id } }),
    ]);

    // Create comments
    await Promise.all([
      prisma.comment.create({
        data: {
          content: 'Started working on OAuth integration with Passport.js',
          taskId: tasks[0].id,
          userId: users[1].id,
        },
      }),
      prisma.comment.create({
        data: {
          content: 'Great progress! Make sure to handle edge cases.',
          taskId: tasks[0].id,
          userId: users[0].id,
        },
      }),
    ]);

    // Create notifications
    await Promise.all([
      prisma.notification.create({
        data: {
          userId: users[1].id,
          type: 'task_assigned',
          message: 'You were assigned to "Design new user authentication flow"',
          read: false,
        },
      }),
      prisma.notification.create({
        data: {
          userId: users[3].id,
          type: 'task_assigned',
          message: 'You were assigned to "Implement real-time collaboration"',
          read: false,
        },
      }),
    ]);

    // Create activity logs
    await Promise.all([
      prisma.boardActivity.create({
        data: {
          boardId: boards[0].id,
          userId: users[0].id,
          action: 'created board "Product Roadmap Q1 2026"',
        },
      }),
      prisma.boardActivity.create({
        data: {
          boardId: boards[0].id,
          userId: users[1].id,
          action: 'added task "Design new user authentication flow"',
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
          tasks: tasks.length,
          boardMembers: boardMembers.length,
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
