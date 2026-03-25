import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Debug: Log CORS configuration
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  FRONTEND_URL: process.env.FRONTEND_URL,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration for production and development
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL || '',
  process.env.CORS_ORIGIN || '',
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
  origin: allowedOrigins,
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

// Simple mock routes that always work
app.get('/api/agents', (req, res) => {
  res.json({ 
    message: 'Agents endpoint',
    agents: [],
    timestamp: new Date().toISOString()
  });
});

app.get('/api/jobs', (req, res) => {
  res.json({ 
    message: 'Jobs endpoint',
    jobs: [],
    timestamp: new Date().toISOString()
  });
});

app.get('/api/analytics', (req, res) => {
  res.json({ 
    message: 'Analytics endpoint',
    data: {},
    timestamp: new Date().toISOString()
  });
});

app.get('/api/analytics/overview', (req, res) => {
  res.json({ 
    message: 'Analytics overview',
    overview: {
      totalAgents: 0,
      activeJobs: 0,
      totalValue: '0'
    },
    timestamp: new Date().toISOString()
  });
});

app.options('*', cors());

// Routes

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

// For Vercel serverless, export the app directly
// Local development can use: npm run dev
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('http');
  const server = createServer(app);
  
  // Try to initialize WebSocket for local development
  try {
    const { initWebSocket } = await import('./services/ws.js');
    initWebSocket(server);
    console.log(`📡 WebSocket server ready`);
  } catch (error) {
    console.log('⚠️ WebSocket not available in this environment');
  }
  
  server.listen(process.env.PORT || 3001, () => {
    console.log(`🚀 SentinelNet Backend running on port ${process.env.PORT || 3001}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;
