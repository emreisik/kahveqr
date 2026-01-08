import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import businessAuthRoutes from './routes/businessAuth.js';
import cafeRoutes from './routes/cafes.js';
import membershipRoutes from './routes/memberships.js';
import activityRoutes from './routes/activities.js';
import userRoutes from './routes/users.js';
import scanRoutes from './routes/scan.js';
import businessStatsRoutes from './routes/businessStats.js';
import businessStaffRoutes from './routes/businessStaff.js';
import branchesRoutes from './routes/branches.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'KahveQR API is running' });
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

