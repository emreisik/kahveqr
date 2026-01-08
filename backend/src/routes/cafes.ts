import express from 'express';
import prisma from '../config/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all cafes (public)
router.get('/', async (req, res) => {
  try {
    const cafes = await prisma.cafe.findMany({
      orderBy: { name: 'asc' },
    });

    res.json(cafes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cafes' });
  }
});

// Get nearby cafes with distance calculation (simplified)
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    // Get all cafes (in production, you'd use PostGIS for proper geospatial queries)
    const cafes = await prisma.cafe.findMany();

    // Calculate distance if coordinates provided
    if (lat && lng) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);

      const cafesWithDistance = cafes.map((cafe) => {
        const distance = calculateDistance(
          userLat,
          userLng,
          cafe.latitude || 0,
          cafe.longitude || 0
        );
        return { ...cafe, distanceKm: distance };
      });

      // Sort by distance
      cafesWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);
      return res.json(cafesWithDistance);
    }

    res.json(cafes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch nearby cafes' });
  }
});

// Get single cafe
router.get('/:id', async (req, res) => {
  try {
    const cafe = await prisma.cafe.findUnique({
      where: { id: req.params.id },
    });

    if (!cafe) {
      return res.status(404).json({ error: 'Cafe not found' });
    }

    res.json(cafe);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cafe' });
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

