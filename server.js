require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const { createClient } = require('redis');

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false
  }
});

// Redis connection handler
redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect()
  .then(() => console.log('Redis connected successfully'))
  .catch(err => console.error('Redis connection failed:', err));

// Middleware
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const redisStatus = redisClient.isReady ? 'connected' : 'disconnected';
  
  res.status(200).json({
    status: 'ok',
    redis: redisStatus,
    environment: {
      REDIS_URL: !!process.env.REDIS_URL,
      NEYNAR_API_KEY: !!process.env.NEYNAR_API_KEY
    }
  });
});

// Handle all routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Redis status: ${redisClient.isReady ? 'ready' : 'connecting'}`);
});
