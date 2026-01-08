import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../config/database.js';
import { generateBusinessToken } from '../middleware/auth.js';

const router = express.Router();

// Validation schema for business login
const businessLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Business Login
router.post('/login', async (req, res) => {
  try {
    const data = businessLoginSchema.parse(req.body);

    const businessUser = await prisma.businessUser.findUnique({
      where: { email: data.email },
      include: { 
        brand: true,
        branch: true,
      },
    });

    if (!businessUser) {
      return res.status(404).json({ error: 'İşletme kullanıcısı bulunamadı' });
    }

    // Check if account is active
    if (!businessUser.isActive) {
      return res.status(403).json({ error: 'Hesabınız devre dışı bırakılmış' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(data.password, businessUser.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Geçersiz şifre' });
    }

    // Update last login time
    await prisma.businessUser.update({
      where: { id: businessUser.id },
      data: { lastLoginAt: new Date() },
    });

    const token = generateBusinessToken(businessUser.id);

    res.json({
      businessUser: {
        id: businessUser.id,
        email: businessUser.email,
        name: businessUser.name,
        role: businessUser.role,
        brandId: businessUser.brandId,
        branchId: businessUser.branchId,
        brand: businessUser.brand,
        branch: businessUser.branch,
      },
      token,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: err.errors });
    }
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;

