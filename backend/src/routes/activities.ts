import express from 'express';
import prisma from '../config/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user's activities
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { type, cafeId, limit = '50' } = req.query;

    const where: any = { userId: req.userId };
    
    if (type && (type === 'earn' || type === 'redeem')) {
      where.type = type;
    }
    
    if (cafeId) {
      where.cafeId = cafeId;
    }

    const activities = await prisma.activity.findMany({
      where,
      include: { cafe: true },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
    });

    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Get activity stats
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const [totalEarned, totalRedeemed, totalActivities] = await Promise.all([
      prisma.activity.aggregate({
        where: { userId: req.userId, type: 'earn' },
        _sum: { delta: true },
      }),
      prisma.activity.aggregate({
        where: { userId: req.userId, type: 'redeem' },
        _sum: { delta: true },
      }),
      prisma.activity.count({
        where: { userId: req.userId },
      }),
    ]);

    res.json({
      totalStampsEarned: totalEarned._sum.delta || 0,
      totalStampsRedeemed: Math.abs(totalRedeemed._sum.delta || 0),
      totalActivities,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity stats' });
  }
});

export default router;

