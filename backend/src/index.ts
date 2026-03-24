import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import wsHelper from './services/ws';
import rateLimit from 'express-rate-limit';

// Routes
import agentRoutes from './routes/agents.js';
import jobRoutes from './routes/jobs.js';
import analyticsRoutes from './routes/analytics.js';
import auditRoutes from './routes/auditRoutes.js';
import tradeRoutes from './routes/tradeRoutes.js';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', process.env.FRONTEND_URL || 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Routes
app.use('/api/agents', agentRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/simulation', (await import('./routes/simulation')).default);

// Root route - API info
app.get('/', (req, res) => {
  res.json({
    service: 'SentinelNet Backend',
    status: 'running',
    version: '1.0',
    endpoints: [
      '/api/agents',
      '/api/jobs',
      '/api/audits',
      '/api/trades',
    ],
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500,
    },
  });
});

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket helper
wsHelper.initWebSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 SentinelNet Backend running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
