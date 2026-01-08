import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../config/database.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Register or login (create user if not exists)
router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if user exists
    let user = await prisma.user.findFirst({
      where: { email: data.email },
    });

    if (user) {
      return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create new user
    user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name || data.email.split('@')[0], // Use email prefix as name if not provided
        passwordHash,
      },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
      },
      token,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: err.errors });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: { email: data.email },
    });

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Verify password
    if (!user.passwordHash) {
      return res.status(401).json({ error: 'Geçersiz şifre' });
    }

    const validPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Geçersiz şifre' });
    }

    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
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

// Demo login (for testing)
router.post('/demo', async (req, res) => {
  try {
    // Get or create demo user
    let user = await prisma.user.findFirst({
      where: { email: 'demo@kahveqr.com' },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'demo@kahveqr.com',
          name: 'Demo Kullanıcı',
          phone: '+905551234567',
        },
      });
    }

    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: 'Demo login failed' });
  }
});

export default router;

