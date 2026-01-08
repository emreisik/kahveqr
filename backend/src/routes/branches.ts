import express from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { authenticateBusinessUser, requireRole, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// All routes require business authentication
router.use(authenticateBusinessUser);

// Validation schemas
const createBranchSchema = z.object({
  name: z.string().min(2),
  address: z.string().optional(),
  phone: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  workingHours: z.any().optional(),
});

const updateBranchSchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  openNow: z.boolean().optional(),
  workingHours: z.any().optional(),
  notificationSettings: z.any().optional(),
});

// Get all branches for the brand (OWNER only)
router.get('/', requireRole(['OWNER', 'BRANCH_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const businessUser = req.businessUser!;
    
    if (!businessUser.brandId) {
      return res.status(400).json({ error: 'Brand ID not found' });
    }

    const branches = await prisma.cafeBranch.findMany({
      where: { brandId: businessUser.brandId },
      orderBy: { createdAt: 'asc' },
    });

    res.json(branches);
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

// Create new branch (OWNER only)
router.post('/', requireRole(['OWNER']), async (req: AuthRequest, res) => {
  try {
    const businessUser = req.businessUser!;
    const data = createBranchSchema.parse(req.body);

    if (!businessUser.brandId) {
      return res.status(400).json({ error: 'Brand ID not found' });
    }

    const branch = await prisma.cafeBranch.create({
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        latitude: data.latitude,
        longitude: data.longitude,
        workingHours: data.workingHours,
        notificationSettings: data.notificationSettings,
        brandId: businessUser.brandId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Şube başarıyla oluşturuldu',
      branch,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Geçersiz veri', details: error.errors });
    }
    console.error('Create branch error:', error);
    res.status(500).json({ error: 'Şube oluşturulamadı' });
  }
});

// Update branch
router.put('/:id', requireRole(['OWNER', 'BRANCH_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const businessUser = req.businessUser!;
    const branchId = req.params.id;
    const data = updateBranchSchema.parse(req.body);

    // Get the branch
    const branch = await prisma.cafeBranch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      return res.status(404).json({ error: 'Şube bulunamadı' });
    }

    // Check permissions
    if (branch.brandId !== businessUser.brandId) {
      return res.status(403).json({ error: 'Bu şubeyi düzenleme yetkiniz yok' });
    }

    // Branch managers can only edit their own branch
    if (businessUser.role === 'BRANCH_MANAGER' && branch.id !== businessUser.branchId) {
      return res.status(403).json({ error: 'Sadece kendi şubenizi düzenleyebilirsiniz' });
    }

    const updatedBranch = await prisma.cafeBranch.update({
      where: { id: branchId },
      data,
    });

    res.json({
      success: true,
      message: 'Şube başarıyla güncellendi',
      branch: updatedBranch,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Geçersiz veri', details: error.errors });
    }
    console.error('Update branch error:', error);
    res.status(500).json({ error: 'Şube güncellenemedi' });
  }
});

// Delete branch (OWNER only)
router.delete('/:id', requireRole(['OWNER']), async (req: AuthRequest, res) => {
  try {
    const businessUser = req.businessUser!;
    const branchId = req.params.id;

    // Get the branch
    const branch = await prisma.cafeBranch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      return res.status(404).json({ error: 'Şube bulunamadı' });
    }

    // Check permissions
    if (branch.brandId !== businessUser.brandId) {
      return res.status(403).json({ error: 'Bu şubeyi silme yetkiniz yok' });
    }

    // Check if there are any business users assigned to this branch
    const usersInBranch = await prisma.businessUser.count({
      where: { branchId },
    });

    if (usersInBranch > 0) {
      return res.status(400).json({ 
        error: 'Bu şubede personel bulunduğu için silinemez. Önce personelleri başka şubeye taşıyın.' 
      });
    }

    await prisma.cafeBranch.delete({
      where: { id: branchId },
    });

    res.json({
      success: true,
      message: 'Şube başarıyla silindi',
    });
  } catch (error) {
    console.error('Delete branch error:', error);
    res.status(500).json({ error: 'Şube silinemedi' });
  }
});

// Get branch statistics
router.get('/:id/stats', requireRole(['OWNER', 'BRANCH_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const businessUser = req.businessUser!;
    const branchId = req.params.id;

    // Get the branch
    const branch = await prisma.cafeBranch.findUnique({
      where: { id: branchId },
    });

    if (!branch || branch.brandId !== businessUser.brandId) {
      return res.status(404).json({ error: 'Şube bulunamadı' });
    }

    // Get activities for this branch
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalActivities, todayActivities, uniqueCustomers] = await Promise.all([
      prisma.activity.count({ where: { branchId } }),
      prisma.activity.count({ 
        where: { 
          branchId,
          createdAt: { gte: today },
        },
      }),
      prisma.activity.findMany({
        where: { branchId },
        distinct: ['userId'],
        select: { userId: true },
      }),
    ]);

    res.json({
      branchId,
      branchName: branch.name,
      totalActivities,
      todayActivities,
      uniqueCustomers: uniqueCustomers.length,
    });
  } catch (error) {
    console.error('Branch stats error:', error);
    res.status(500).json({ error: 'İstatistikler alınamadı' });
  }
});

export default router;

