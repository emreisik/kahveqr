import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';

// Import routes - use require for CommonJS compatibility
const authRoutes = require('../backend/src/routes/auth.js');
const businessAuthRoutes = require('../backend/src/routes/businessAuth.js');
const cafeRoutes = require('../backend/src/routes/cafes.js');
const membershipRoutes = require('../backend/src/routes/memberships.js');
const activityRoutes = require('../backend/src/routes/activities.js');
const userRoutes = require('../backend/src/routes/users.js');
const scanRoutes = require('../backend/src/routes/scan.js');
const businessStatsRoutes = require('../backend/src/routes/businessStats.js');
const businessStaffRoutes = require('../backend/src/routes/businessStaff.js');
const branchesRoutes = require('../backend/src/routes/branches.js');

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'KahveQR API is running on Vercel',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/business-auth', businessAuthRoutes);
app.use('/api/cafes', cafeRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/business', businessStatsRoutes);
app.use('/api/business/staff', businessStaffRoutes);
app.use('/api/business/branches', branchesRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Export Vercel serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  // Convert Vercel request to Express-compatible request
  return new Promise((resolve, reject) => {
    app(req as any, res as any, (err?: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
};

