import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { securityHeaders, apiLimiter, requestLogger } from './middleware/security';
import { sanitizeInput } from './middleware/validation';

// Import routes
import memberRoutes from './routes/members';
import studyRoutes from './routes/studies';
import applicationRoutes from './routes/applications';
import dashboardRoutes from './routes/dashboard';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

// Middleware
app.use(securityHeaders);
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);
app.use(sanitizeInput);

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'BGWealth API is running',
    timestamp: new Date().toISOString(),
    version: API_VERSION
  });
});

// API Routes
app.use(`/api/${API_VERSION}/members`, memberRoutes);
app.use(`/api/${API_VERSION}/studies`, studyRoutes);
app.use(`/api/${API_VERSION}/applications`, applicationRoutes);
app.use(`/api/${API_VERSION}/dashboard`, dashboardRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to BGWealth Control Dashboard API',
    version: API_VERSION,
    documentation: '/api/docs',
    endpoints: {
      health: '/health',
      members: `/api/${API_VERSION}/members`,
      studies: `/api/${API_VERSION}/studies`,
      applications: `/api/${API_VERSION}/applications`,
      dashboard: `/api/${API_VERSION}/dashboard`
    }
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`BGWealth Control Dashboard API`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server running on port ${PORT}`);
  console.log(`API Version: ${API_VERSION}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
});

export default app;
