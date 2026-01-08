import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'KahveQR API is running on Netlify - MINIMAL VERSION',
    timestamp: new Date().toISOString(),
    path: req.path,
    url: req.url,
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint works!' });
});

// 404 handler
app.use((req, res) => {
  console.log('404 - Request URL:', req.url, 'Path:', req.path);
  res.status(404).json({ 
    error: 'Not found',
    requestedUrl: req.url,
    requestedPath: req.path,
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Export as Netlify Function
export const handler = serverless(app);
