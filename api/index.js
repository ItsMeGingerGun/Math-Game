import './lib/env-loader'; // Must be first
import express from 'express';
import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3000;

// Vercel-specific optimization
if (process.env.VERCEL) {
  app.use((req, res, next) => {
    req.vercelRequestId = uuidv4();
    console.log(`[${req.vercelRequestId}] ${req.method} ${req.url}`);
    next();
  });
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redis Connection Handler
const getRedisClient = async () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) throw new Error('REDIS_URL not set');
  
  const client = createClient({
    url: redisUrl,
    socket: {
      tls: true,
      rejectUnauthorized: false,
      connectTimeout: 3000,
      reconnectStrategy: (retries) => Math.min(retries * 100, 1000)
    }
  });
  
  client.on('error', err => console.error('Redis Client Error:', err));
  
  try {
    await client.connect();
    return client;
  } catch (err) {
    console.error('Redis connection failed:', err);
    return null;
  }
};

// Cache-Control Middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
  }
  next();
});

// Health Endpoint (Vercel-safe)
app.get('/api/health', async (req, res) => {
  try {
    const start = Date.now();
    const redisClient = await getRedisClient();
    
    const status = {
      status: 'ok',
      redis: 'disconnected',
      latency: 0,
      farcaster: !!process.env.NEYNAR_API_KEY,
      environment: process.env.VERCEL_ENV || 'development',
      region: process.env.VERCEL_REGION || 'local',
      requestId: req.vercelRequestId || 'N/A'
    };
    
    if (redisClient) {
      const pingStart = Date.now();
      await redisClient.ping();
      status.redis = 'connected';
      status.latency = Date.now() - pingStart;
      await redisClient.quit();
    }
    
    res.json(status);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      requestId: req.vercelRequestId || 'N/A'
    });
  }
});

// Game Endpoints
app.post('/api/game', async (req, res) => {
  try {
    const redisClient = await getRedisClient();
    if (!redisClient) {
      return res.status(503).json({ error: 'Redis unavailable' });
    }
    
    // Game logic here
    const result = { success: true, score: 100 };
    
    await redisClient.quit();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files
app.use(express.static('public', {
  maxAge: '1h',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0');
    }
  }
}));

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(process.cwd() + '/public/index.html');
});

// Vercel requires this export
export default app;
