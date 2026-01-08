import express from 'express';
import prisma from '../config/database.js';
import { authenticateBusinessUser, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// All routes require business authentication
router.use(authenticateBusinessUser);

// Get dashboard statistics
router.get('/dashboard', async (req: AuthRequest, res) => {
  try {
    const businessUser = req.businessUser!;
    
    const brandId = businessUser.brandId;
    const branchId = businessUser.branchId;
    const role = businessUser.role;

    if (!brandId) {
      return res.status(400).json({ error: 'Brand ID not found' });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    // Build activity filter based on role
    const activityFilter: any = { brandId };
    
    // If branch manager or staff, filter by their branch only
    if ((role === 'BRANCH_MANAGER' || role === 'STAFF') && branchId) {
      activityFilter.branchId = branchId;
    }

    // Today's stats
    const todayActivities = await prisma.activity.findMany({
      where: {
        ...activityFilter,
        createdAt: { gte: today },
      },
    });

    const todayStamps = todayActivities.filter(a => a.type === 'earn').length;
    const todayRedeems = todayActivities.filter(a => a.type === 'redeem').length;
    const todayCustomers = new Set(todayActivities.map(a => a.userId)).size;

    // Yesterday's stats for comparison
    const yesterdayActivities = await prisma.activity.findMany({
      where: {
        ...activityFilter,
        createdAt: { gte: yesterday, lt: today },
      },
    });
    const yesterdayStamps = yesterdayActivities.filter(a => a.type === 'earn').length;

    // Week stats
    const weekActivities = await prisma.activity.findMany({
      where: {
        ...activityFilter,
        createdAt: { gte: weekAgo },
      },
    });

    const weekStamps = weekActivities.filter(a => a.type === 'earn').length;
    const weekRedeems = weekActivities.filter(a => a.type === 'redeem').length;
    const weekCustomers = new Set(weekActivities.map(a => a.userId)).size;

    // Month stats
    const monthActivities = await prisma.activity.findMany({
      where: {
        ...activityFilter,
        createdAt: { gte: monthAgo },
      },
    });

    const monthStamps = monthActivities.filter(a => a.type === 'earn').length;
    const monthRedeems = monthActivities.filter(a => a.type === 'redeem').length;
    const monthCustomers = new Set(monthActivities.map(a => a.userId)).size;

    // Calculate change percentage
    const stampsChange = yesterdayStamps > 0 
      ? ((todayStamps - yesterdayStamps) / yesterdayStamps) * 100 
      : todayStamps > 0 ? 100 : 0;

    // Recent transactions (last 10)
    const recentTransactions = await prisma.activity.findMany({
      where: activityFilter,
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        branch: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json({
      today: {
        stamps: todayStamps,
        redeems: todayRedeems,
        customers: todayCustomers,
        stampsChange: Number(stampsChange.toFixed(1)),
      },
      week: {
        stamps: weekStamps,
        redeems: weekRedeems,
        customers: weekCustomers,
      },
      month: {
        stamps: monthStamps,
        redeems: monthRedeems,
        customers: monthCustomers,
      },
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        type: t.type === 'earn' ? 'stamp' : 'redeem',
        customer: t.user.name || t.user.email || 'Unknown',
        branch: t.branch?.name || 'Unknown',
        time: t.createdAt,
      })),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get customers list
router.get('/customers', async (req: AuthRequest, res) => {
  try {
    const businessUser = req.businessUser!;
    const brandId = businessUser.brandId;

    if (!brandId) {
      return res.status(400).json({ error: 'Brand ID not found' });
    }

    // Get all memberships for this brand
    const memberships = await prisma.membership.findMany({
      where: { brandId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        lastStampAt: 'desc',
      },
    });

    // Get total activities for each user
    const customers = await Promise.all(
      memberships.map(async (m) => {
        const activities = await prisma.activity.findMany({
          where: {
            userId: m.userId,
            brandId,
          },
        });

        const totalStamps = activities.filter(a => a.type === 'earn').length;
        const totalRedeems = activities.filter(a => a.type === 'redeem').length;

        return {
          id: m.user.id,
          name: m.user.name || m.user.email || 'Unknown',
          email: m.user.email || '',
          currentStamps: m.stamps,
          totalStamps,
          totalRedeems,
          lastVisit: m.lastStampAt || m.joinedAt,
          memberSince: m.joinedAt,
        };
      })
    );

    res.json(customers);
  } catch (error) {
    console.error('Customers list error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get transactions history
router.get('/transactions', async (req: AuthRequest, res) => {
  try {
    const businessUser = req.businessUser!;
    const { type, dateRange, search } = req.query;
    
    const brandId = businessUser.brandId;
    const branchId = businessUser.branchId;
    const role = businessUser.role;

    if (!brandId) {
      return res.status(400).json({ error: 'Brand ID not found' });
    }

    // Build filter
    const where: any = { brandId };

    // If branch manager or staff, filter by their branch
    if ((role === 'BRANCH_MANAGER' || role === 'STAFF') && branchId) {
      where.branchId = branchId;
    }

    // Type filter
    if (type && type !== 'all') {
      where.type = type === 'stamp' ? 'earn' : 'redeem';
    }

    // Date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (dateRange === 'today') {
        where.createdAt = { gte: today };
      } else if (dateRange === 'week') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        where.createdAt = { gte: weekAgo };
      } else if (dateRange === 'month') {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        where.createdAt = { gte: monthAgo };
      }
    }

    // Get transactions
    let transactions = await prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        branch: {
          select: {
            name: true,
          },
        },
      },
    });

    // Search filter (apply after fetch)
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      transactions = transactions.filter(t => 
        t.user.name?.toLowerCase().includes(searchLower) ||
        t.user.email?.toLowerCase().includes(searchLower)
      );
    }

    res.json(
      transactions.map(t => ({
        id: t.id,
        type: t.type === 'earn' ? 'stamp' : 'redeem',
        customerName: t.user.name || t.user.email || 'Unknown',
        customerEmail: t.user.email || '',
        branchName: t.branch?.name || 'Unknown',
        timestamp: t.createdAt,
        staffName: businessUser.name,
      }))
    );
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get statistics for charts
router.get('/statistics', async (req: AuthRequest, res) => {
  try {
    const businessUser = req.businessUser!;
    const { dateRange } = req.query;
    
    const brandId = businessUser.brandId;
    const branchId = businessUser.branchId;
    const role = businessUser.role;

    if (!brandId) {
      return res.status(400).json({ error: 'Brand ID not found' });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let startDate: Date;
    if (dateRange === 'today') {
      startDate = today;
    } else if (dateRange === 'month') {
      startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      // week
      startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const activityFilter: any = { brandId, createdAt: { gte: startDate } };
    
    // If branch manager or staff, filter by their branch
    if ((role === 'BRANCH_MANAGER' || role === 'STAFF') && branchId) {
      activityFilter.branchId = branchId;
    }

    const activities = await prisma.activity.findMany({
      where: activityFilter,
      orderBy: { createdAt: 'asc' },
    });

    const stamps = activities.filter(a => a.type === 'earn');
    const redeems = activities.filter(a => a.type === 'redeem');
    const uniqueCustomers = new Set(activities.map(a => a.userId)).size;
    const avgStampsPerCustomer = uniqueCustomers > 0 
      ? stamps.length / uniqueCustomers 
      : 0;
    const conversionRate = stamps.length > 0 
      ? (redeems.length / stamps.length) * 100 
      : 0;

    // Hourly activity (for today or recent)
    const hourlyData: any = {};
    for (let hour = 9; hour <= 18; hour++) {
      hourlyData[hour] = 0;
    }

    activities.forEach(activity => {
      const hour = activity.createdAt.getHours();
      if (hour >= 9 && hour <= 18) {
        hourlyData[hour]++;
      }
    });

    res.json({
      totalStamps: stamps.length,
      totalRedeems: redeems.length,
      uniqueCustomers,
      avgStampsPerCustomer: Number(avgStampsPerCustomer.toFixed(2)),
      conversionRate: Number(conversionRate.toFixed(1)),
      hourlyActivity: Object.entries(hourlyData).map(([hour, count]) => ({
        hour: `${hour}:00`,
        stamps: count,
      })),
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get settings
router.get('/settings', async (req: AuthRequest, res) => {
  try {
    const businessUser = req.businessUser!;
    const brandId = businessUser.brandId;
    const branchId = businessUser.branchId;

    if (!brandId) {
      return res.status(400).json({ error: 'Brand ID not found' });
    }

    const brand = await prisma.cafeBrand.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    let branchInfo = null;
    if (branchId) {
      const branch = await prisma.cafeBranch.findUnique({
        where: { id: branchId },
      });
      branchInfo = branch;
    }

    res.json({
      businessInfo: {
        name: brand.name,
        category: brand.category || '',
        stampsRequired: brand.stampsRequired,
        rewardName: brand.rewardName,
        email: businessUser.email,
      },
      branch: branchInfo,
    });
  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings
router.put('/settings', async (req: AuthRequest, res) => {
  try {
    const businessUser = req.businessUser!;
    const { businessInfo, branch: branchData } = req.body;
    
    const brandId = businessUser.brandId;
    const branchId = businessUser.branchId;

    if (!brandId) {
      return res.status(400).json({ error: 'Brand ID not found' });
    }

    // Update brand info (OWNER only)
    if (businessInfo && businessUser.role === 'OWNER') {
      const updateData: any = {};
      if (businessInfo.name) updateData.name = businessInfo.name;
      if (businessInfo.category) updateData.category = businessInfo.category;

      await prisma.cafeBrand.update({
        where: { id: brandId },
        data: updateData,
      });
    }

    // Update branch info (if user has a branch)
    if (branchData && branchId) {
      const updateData: any = {};
      if (branchData.address !== undefined) updateData.address = branchData.address;
      if (branchData.phone !== undefined) updateData.phone = branchData.phone;
      if (branchData.workingHours) updateData.workingHours = branchData.workingHours;
      if (branchData.notificationSettings) updateData.notificationSettings = branchData.notificationSettings;

      await prisma.cafeBranch.update({
        where: { id: branchId },
        data: updateData,
      });
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Get loyalty program settings
router.get('/loyalty', async (req: AuthRequest, res) => {
  try {
    const businessUser = req.businessUser!;
    const brandId = businessUser.brandId;

    if (!brandId) {
      return res.status(400).json({ error: 'Brand ID not found' });
    }

    const brand = await prisma.cafeBrand.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    const loyaltySettings = brand.loyaltySettings as any || {
      isActive: true,
      validityDays: 90,
      maxStampsPerDay: 5,
    };

    res.json({
      stampsRequired: brand.stampsRequired,
      rewardName: brand.rewardName,
      isActive: loyaltySettings.isActive ?? true,
      validityDays: loyaltySettings.validityDays ?? 90,
      maxStampsPerDay: loyaltySettings.maxStampsPerDay ?? 5,
    });
  } catch (error) {
    console.error('Loyalty program error:', error);
    res.status(500).json({ error: 'Failed to fetch loyalty program' });
  }
});

// Update loyalty program settings
router.put('/loyalty', async (req: AuthRequest, res) => {
  try {
    const businessUser = req.businessUser!;
    const { stampsRequired, rewardName, isActive, validityDays, maxStampsPerDay } = req.body;
    
    const brandId = businessUser.brandId;

    if (!brandId) {
      return res.status(400).json({ error: 'Brand ID not found' });
    }

    const updateData: any = {};

    // Update basic settings
    if (stampsRequired !== undefined) updateData.stampsRequired = stampsRequired;
    if (rewardName !== undefined) updateData.rewardName = rewardName;

    // Update loyalty settings
    const loyaltySettings: any = {};
    if (isActive !== undefined) loyaltySettings.isActive = isActive;
    if (validityDays !== undefined) loyaltySettings.validityDays = validityDays;
    if (maxStampsPerDay !== undefined) loyaltySettings.maxStampsPerDay = maxStampsPerDay;

    if (Object.keys(loyaltySettings).length > 0) {
      // Get current settings and merge
      const currentBrand = await prisma.cafeBrand.findUnique({
        where: { id: brandId },
        select: { loyaltySettings: true },
      });

      updateData.loyaltySettings = {
        ...(currentBrand?.loyaltySettings as any || {}),
        ...loyaltySettings,
      };
    }

    const updatedBrand = await prisma.cafeBrand.update({
      where: { id: brandId },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Loyalty program updated successfully',
      brand: updatedBrand,
    });
  } catch (error) {
    console.error('Update loyalty program error:', error);
    res.status(500).json({ error: 'Failed to update loyalty program' });
  }
});

export default router;
