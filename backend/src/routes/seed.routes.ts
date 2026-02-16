import { Router, Request, Response } from 'express';
import { config } from '../config';
import { seedDatabase } from '../lib/seedDatabase';

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
    const result = await seedDatabase();
    console.log('✅ Database seeded successfully via API!');

    res.json({
      success: true,
      data: {
        message: 'Database seeded successfully',
        stats: {
          users: result.users.length,
          tasks: result.allTasks.length,
        },
        demoCredentials: {
          password: 'Demo123!',
          availableUsers: result.users.map((u) => u.email),
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
