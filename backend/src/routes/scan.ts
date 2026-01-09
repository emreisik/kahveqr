import express from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { authenticateBusinessUser, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// QR Code scan schema
const scanSchema = z.object({
  qrData: z.string(),
});

// Parse QR data
function parseQRData(qrData: string) {
  try {
    return JSON.parse(qrData);
  } catch {
    throw new Error('Invalid QR code format');
  }
}

// Scan user QR to add stamp (business user endpoint)
router.post('/stamp', authenticateBusinessUser, async (req: AuthRequest, res) => {
  try {
    const businessUser = req.businessUser!;
    const { qrData } = scanSchema.parse(req.body);
    const data = parseQRData(qrData);

    // Validate QR data
    if (data.type !== 'user') {
      return res.status(400).json({ error: 'Bu QR kod damga kazanmak için kullanılamaz' });
    }

    // Get user ID from QR
    const customerId = data.userId;
    if (!customerId) {
      return res.status(400).json({ error: 'Geçersiz QR kod' });
    }

    // Check QR timestamp (prevent replay attacks)
    const qrAge = Date.now() - data.timestamp;
    if (qrAge > 5 * 60 * 1000) {
      return res.status(400).json({ error: 'QR kod süresi dolmuş. Lütfen QR sekmesini yenileyin.' });
    }

    // Get brand and branch from business user
    const brandId = businessUser.brandId;
    let branchId = businessUser.branchId;

    if (!brandId) {
      return res.status(400).json({ error: 'Marka bilgisi bulunamadı' });
    }

    // If branchId is null (OWNER user), use first branch of the brand
    if (!branchId) {
      const firstBranch = await prisma.cafeBranch.findFirst({
        where: { brandId },
        orderBy: { createdAt: 'asc' },
      });
      
      if (!firstBranch) {
        return res.status(400).json({ error: 'Bu markaya ait şube bulunamadı' });
      }
      
      branchId = firstBranch.id;
    }

    // Verify customer exists
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ 
        error: 'Kullanıcı bulunamadı. Lütfen uygulamadan çıkış yapıp tekrar giriş yapın.' 
      });
    }

    // Get brand info
    const brand = await prisma.cafeBrand.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      return res.status(404).json({ error: 'Marka bulunamadı' });
    }

    // Check if customer has membership (brand level)
    let membership = await prisma.membership.findUnique({
      where: {
        userId_brandId: {
          userId: customerId,
          brandId,
        },
      },
      include: { brand: true, user: true },
    });

    // If no membership, create one
    if (!membership) {
      membership = await prisma.membership.create({
        data: {
          userId: customerId,
          brandId,
          stamps: 0,
        },
        include: { brand: true, user: true },
      });
    }

    // Check cooldown period (prevent multiple stamps in short time at any branch)
    if (membership.lastStampAt) {
      const timeSinceLastStamp = Date.now() - membership.lastStampAt.getTime();
      const cooldownPeriod = 30 * 1000; // 30 seconds
      
      if (timeSinceLastStamp < cooldownPeriod) {
        const remainingSeconds = Math.ceil((cooldownPeriod - timeSinceLastStamp) / 1000);
        return res.status(429).json({ 
          error: `Çok hızlı! ${remainingSeconds} saniye sonra tekrar deneyin.`,
          remainingSeconds,
        });
      }
    }

    // Add stamp (brand level)
    const updated = await prisma.membership.update({
      where: {
        userId_brandId: {
          userId: customerId,
          brandId,
        },
      },
      data: {
        stamps: membership.stamps + 1,
        lastStampAt: new Date(),
      },
      include: { brand: true, user: true },
    });

    // Create activity (with branch info)
    await prisma.activity.create({
      data: {
        userId: customerId,
        brandId,
        branchId,
        type: 'earn',
        delta: 1,
      },
    });

    res.json({
      success: true,
      message: `Damga eklendi! ${updated.stamps}/${updated.brand.stampsRequired}`,
      membership: updated,
      brand: updated.brand,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Geçersiz istek', details: err.errors });
    }
    console.error('Stamp scan error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'QR kod taranamadı' });
  }
});

// Scan redemption QR to redeem reward (business user endpoint)
router.post('/redeem', authenticateBusinessUser, async (req: AuthRequest, res) => {
  try {
    const businessUser = req.businessUser!;
    const { qrData } = scanSchema.parse(req.body);
    const data = parseQRData(qrData);

    // Validate QR data
    if (data.type !== 'redeem') {
      return res.status(400).json({ error: 'Bu QR kod ödül kullanmak için değil' });
    }

    const customerId = data.userId;
    const brandId = data.brandId;

    if (!customerId || !brandId) {
      return res.status(400).json({ error: 'Geçersiz QR kod' });
    }

    // Verify business user is from the same brand
    if (brandId !== businessUser.brandId) {
      return res.status(403).json({ error: 'Bu QR kod başka bir markaya ait' });
    }

    let branchId = businessUser.branchId;
    
    // If branchId is null (OWNER user), use first branch of the brand
    if (!branchId) {
      const firstBranch = await prisma.cafeBranch.findFirst({
        where: { brandId },
        orderBy: { createdAt: 'asc' },
      });
      
      if (!firstBranch) {
        return res.status(400).json({ error: 'Bu markaya ait şube bulunamadı' });
      }
      
      branchId = firstBranch.id;
    }

    // Check QR code age (valid for 5 minutes)
    const qrAge = Date.now() - data.timestamp;
    if (qrAge > 5 * 60 * 1000) {
      return res.status(400).json({ error: 'QR kod süresi dolmuş. Lütfen yenileyin.' });
    }

    // Get membership (brand level)
    const membership = await prisma.membership.findUnique({
      where: {
        userId_brandId: {
          userId: customerId,
          brandId,
        },
      },
      include: { brand: true, user: true },
    });

    if (!membership) {
      return res.status(404).json({ error: 'Üyelik bulunamadı' });
    }

    if (membership.stamps < membership.brand.stampsRequired) {
      return res.status(400).json({ 
        error: `Yetersiz damga. ${membership.brand.stampsRequired - membership.stamps} damga daha gerekli.` 
      });
    }

    // Redeem reward (brand level)
    const updated = await prisma.membership.update({
      where: {
        userId_brandId: {
          userId: customerId,
          brandId,
        },
      },
      data: {
        stamps: membership.stamps - membership.brand.stampsRequired,
      },
      include: { brand: true, user: true },
    });

    // Create activity (with branch info where redemption happened)
    await prisma.activity.create({
      data: {
        userId: customerId,
        brandId,
        branchId,
        type: 'redeem',
        delta: -membership.brand.stampsRequired,
      },
    });

    res.json({
      success: true,
      message: `${membership.brand.rewardName} ödülü kullanıldı!`,
      membership: updated,
      reward: membership.brand.rewardName,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Geçersiz istek', details: err.errors });
    }
    console.error('Redeem scan error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'QR kod taranamadı' });
  }
});

export default router;
