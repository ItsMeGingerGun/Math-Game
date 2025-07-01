require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const redisClient = require('./lib/redis')();

const app = express();

// Security middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"]
    }
  }
}));

// Middleware
app.use(express.json());

// API Routes
app.use('/api/health', require('./api/health'));
app.use('/api/redis-test', require('./api/redis-test'));
app.use('/api/leaderboard', require('./api/leaderboard'));
app.use('/api/game', require('./api/game'));

// Serve static files with proper caching
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1h',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0');
    }
  }
}));

// Client-side routing fallback - Vercel-specific handling
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}]`, err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Vercel requires module.exports for serverless functions
module.exports = app;

// Only listen locally, not on Vercel
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Listening on port ${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received: closing server');
    await redisClient.quit();
    server.close(() => {
      console.log('Server terminated');
      process.exit(0);
    });
  });
}
