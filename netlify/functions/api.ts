import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from '../../backend/src/routes/auth.js';
import businessAuthRoutes from '../../backend/src/routes/businessAuth.js';
import cafeRoutes from '../../backend/src/routes/cafes.js';
import membershipRoutes from '../../backend/src/routes/memberships.js';
import activityRoutes from '../../backend/src/routes/activities.js';
import userRoutes from '../../backend/src/routes/users.js';
import scanRoutes from '../../backend/src/routes/scan.js';
import businessStatsRoutes from '../../backend/src/routes/businessStats.js';
import businessStaffRoutes from '../../backend/src/routes/businessStaff.js';
import branchesRoutes from '../../backend/src/routes/branches.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());

// Health check - Netlify redirects /api/health to /.netlify/functions/api/health
// serverless-http receives /health (without /api prefix)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'KahveQR API is running on Netlify Pro',
    timestamp: new Date().toISOString(),
  });
});

// Routes - WITHOUT /api prefix (Netlify strips it automatically)
app.use('/auth', authRoutes);
app.use('/business-auth', businessAuthRoutes);
app.use('/cafes', cafeRoutes);
app.use('/memberships', membershipRoutes);
app.use('/activities', activityRoutes);
app.use('/users', userRoutes);
app.use('/scan', scanRoutes);
app.use('/business', businessStatsRoutes);
app.use('/business/staff', businessStaffRoutes);
app.use('/business/branches', branchesRoutes);

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

// Export as Netlify Function
export const handler = serverless(app);
