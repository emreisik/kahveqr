import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../config/database.js';
import { authenticateBusinessUser, requireRole, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// All routes require business authentication
router.use(authenticateBusinessUser);

// Validation schemas
const createStaffSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  role: z.enum(['OWNER', 'BRANCH_MANAGER', 'STAFF']),
  branchId: z.string().uuid().optional(),
});

const updateStaffSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['OWNER', 'BRANCH_MANAGER', 'STAFF']).optional(),
  isActive: z.boolean().optional(),
});

// Get all staff (OWNER sees all, BRANCH_MANAGER sees only their staff)
router.get('/', async (req: AuthRequest, res) => {
  try {
    const businessUser = req.businessUser!;
    
    const where: any = {};
    
    if (businessUser.role === 'BRANCH_MANAGER') {
      // Branch managers can only see staff they created in their branch
      where.branchId = businessUser.branchId;
      where.createdBy = businessUser.id;
    } else if (businessUser.role === 'OWNER') {
      // Owners see all staff in their brand
      where.brandId = businessUser.brandId;
    } else {
      // STAFF cannot view other staff
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const staff = await prisma.businessUser.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdBy: true,
        lastLoginAt: true,
        createdAt: true,
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(staff);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// Create new staff member (OWNER or BRANCH_MANAGER only)
router.post('/', requireRole(['OWNER', 'BRANCH_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const businessUser = req.businessUser!;
    const data = createStaffSchema.parse(req.body);

    // Branch managers can only create STAFF
    if (businessUser.role === 'BRANCH_MANAGER') {
      if (data.role !== 'STAFF') {
        return res.status(403).json({ 
          error: 'Şube yöneticileri sadece personel ekleyebilir' 
        });
      }
      // Must be in their branch
      if (data.branchId && data.branchId !== businessUser.branchId) {
        return res.status(403).json({ 
          error: 'Sadece kendi şubenize personel ekleyebilirsiniz' 
        });
      }
    }

    // For OWNER, branchId is required
    if (businessUser.role === 'OWNER' && !data.branchId) {
      return res.status(400).json({ 
        error: 'Şube seçimi zorunludur' 
      });
    }

    // Check if email already exists
    const existingUser = await prisma.businessUser.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create staff member
    const newStaff = await prisma.businessUser.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        role: data.role,
        brandId: businessUser.brandId,
        branchId: data.branchId || businessUser.branchId,
        createdBy: businessUser.id,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Personel başarıyla oluşturuldu',
      staff: newStaff,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Geçersiz veri', details: error.errors });
    }
    console.error('Create staff error:', error);
    res.status(500).json({ error: 'Personel oluşturulamadı' });
  }
});

// Update staff member
router.put('/:id', requireRole(['OWNER', 'BRANCH_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const businessUser = req.businessUser!;
    const staffId = req.params.id;
    const data = updateStaffSchema.parse(req.body);

    // Get the staff member to update
    const existingStaff = await prisma.businessUser.findUnique({
      where: { id: staffId },
    });

    if (!existingStaff) {
      return res.status(404).json({ error: 'Personel bulunamadı' });
    }

    // Branch managers can only update staff they created
    if (businessUser.role === 'BRANCH_MANAGER') {
      if (existingStaff.createdBy !== businessUser.id) {
        return res.status(403).json({ 
          error: 'Bu personeli düzenleme yetkiniz yok' 
        });
      }
      // Cannot change role
      if (data.role && data.role !== 'STAFF') {
        return res.status(403).json({ 
          error: 'Personel rolünü değiştiremezsiniz' 
        });
      }
    }

    // Owners cannot downgrade themselves
    if (businessUser.role === 'OWNER' && existingStaff.id === businessUser.id) {
      if (data.role && data.role !== 'OWNER') {
        return res.status(403).json({ 
          error: 'Kendi rolünüzü değiştiremezsiniz' 
        });
      }
      if (data.isActive === false) {
        return res.status(403).json({ 
          error: 'Kendi hesabınızı devre dışı bırakamazsınız' 
        });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.role) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const updatedStaff = await prisma.businessUser.update({
      where: { id: staffId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Personel başarıyla güncellendi',
      staff: updatedStaff,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Geçersiz veri', details: error.errors });
    }
    console.error('Update staff error:', error);
    res.status(500).json({ error: 'Personel güncellenemedi' });
  }
});

// Delete/deactivate staff member
router.delete('/:id', requireRole(['OWNER', 'BRANCH_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const businessUser = req.businessUser!;
    const staffId = req.params.id;

    // Get the staff member to delete
    const existingStaff = await prisma.businessUser.findUnique({
      where: { id: staffId },
    });

    if (!existingStaff) {
      return res.status(404).json({ error: 'Personel bulunamadı' });
    }

    // Cannot delete yourself
    if (existingStaff.id === businessUser.id) {
      return res.status(403).json({ error: 'Kendi hesabınızı silemezsiniz' });
    }

    // Branch managers can only delete staff they created
    if (businessUser.role === 'BRANCH_MANAGER') {
      if (existingStaff.createdBy !== businessUser.id) {
        return res.status(403).json({ 
          error: 'Bu personeli silme yetkiniz yok' 
        });
      }
    }

    // Soft delete by deactivating
    await prisma.businessUser.update({
      where: { id: staffId },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Personel başarıyla devre dışı bırakıldı',
    });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ error: 'Personel silinemedi' });
  }
});

// Activate staff member
router.post('/:id/activate', requireRole(['OWNER']), async (req: AuthRequest, res) => {
  try {
    const staffId = req.params.id;

    await prisma.businessUser.update({
      where: { id: staffId },
      data: { isActive: true },
    });

    res.json({
      success: true,
      message: 'Personel başarıyla aktifleştirildi',
    });
  } catch (error) {
    console.error('Activate staff error:', error);
    res.status(500).json({ error: 'Personel aktifleştirilemedi' });
  }
});

// Reset staff password (OWNER or BRANCH_MANAGER)
router.post('/:id/reset-password', requireRole(['OWNER', 'BRANCH_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const businessUser = req.businessUser!;
    const staffId = req.params.id;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır' });
    }

    // Get the staff member
    const existingStaff = await prisma.businessUser.findUnique({
      where: { id: staffId },
    });

    if (!existingStaff) {
      return res.status(404).json({ error: 'Personel bulunamadı' });
    }

    // Branch managers can only reset passwords for staff they created
    if (businessUser.role === 'BRANCH_MANAGER') {
      if (existingStaff.createdBy !== businessUser.id) {
        return res.status(403).json({ 
          error: 'Bu personelin şifresini sıfırlama yetkiniz yok' 
        });
      }
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.businessUser.update({
      where: { id: staffId },
      data: { passwordHash },
    });

    res.json({
      success: true,
      message: 'Şifre başarıyla sıfırlandı',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Şifre sıfırlanamadı' });
  }
});

export default router;

