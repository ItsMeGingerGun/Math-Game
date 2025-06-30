app.get('/api/health', async (req, res) => {
  try {
    // Test Redis connection
    await redisClient.ping();
    
    res.status(200).json({
      status: 'ok',
      redis: 'connected',
      environment: {
        REDIS_URL: !!process.env.REDIS_URL,
        NEYNAR_API_KEY: !!process.env.NEYNAR_API_KEY
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      redis: 'disconnected',
      error: error.message
    });
  }
});
