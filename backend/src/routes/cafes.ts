import express from 'express';
import prisma from '../config/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all brands (public)
router.get('/', async (req, res) => {
  try {
    const brands = await prisma.cafeBrand.findMany({
      orderBy: { name: 'asc' },
      include: {
        branches: true,
      },
    });

    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// Get nearby branches with distance calculation (simplified)
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    // Get all branches (in production, you'd use PostGIS for proper geospatial queries)
    const branches = await prisma.cafeBranch.findMany({
      include: {
        brand: true,
      },
    });

    // Calculate distance if coordinates provided
    if (lat && lng) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);

      const branchesWithDistance = branches.map((branch) => {
        const distance = calculateDistance(
          userLat,
          userLng,
          branch.latitude || 0,
          branch.longitude || 0
        );
        return { ...branch, distanceKm: distance };
      });

      // Sort by distance
      branchesWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);
      return res.json(branchesWithDistance);
    }

    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch nearby branches' });
  }
});

// Get single brand
router.get('/:id', async (req, res) => {
  try {
    const brand = await prisma.cafeBrand.findUnique({
      where: { id: req.params.id },
      include: {
        branches: true,
      },
    });

    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.json(brand);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
});

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export default router;

