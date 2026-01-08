import express from 'express';
import prisma from '../config/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user's memberships (with brand info)
router.get('/', async (req: AuthRequest, res) => {
  try {
    const memberships = await prisma.membership.findMany({
      where: { userId: req.userId },
      include: { brand: true },
      orderBy: { joinedAt: 'desc' },
    });

    res.json(memberships);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch memberships' });
  }
});

// Get single membership by brand ID
router.get('/:brandId', async (req: AuthRequest, res) => {
  try {
    const membership = await prisma.membership.findUnique({
      where: {
        userId_brandId: {
          userId: req.userId!,
          brandId: req.params.brandId,
        },
      },
      include: { brand: true },
    });

    if (!membership) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    res.json(membership);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch membership' });
  }
});

export default router;
