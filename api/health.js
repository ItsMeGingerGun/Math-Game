const redisClient = require('../lib/redis')();

module.exports = async (req, res) => {
  try {
    // Vercel-safe Redis check
    const status = {
      redis: 'disconnected',
      latency: 'n/a'
    };
    
    if (redisClient.isReady) {
      const startTime = Date.now();
      await redisClient.ping();
      status.redis = 'connected';
      status.latency = `${Date.now() - startTime}ms`;
    }
    
    res.status(200).json({
      status: 'ok',
      services: {
        database: status,
        farcaster: !!process.env.NEYNAR_API_KEY ? 'configured' : 'missing'
      },
      environment: process.env.NODE_ENV || 'development',
      platform: process.env.VERCEL ? 'Vercel' : 'Local',
      region: process.env.VERCEL_REGION || 'local'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message,
      platform: process.env.VERCEL ? 'Vercel' : 'Local'
    });
  }
};
