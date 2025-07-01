const redisClient = require('../lib/redis')();

module.exports = async (req, res) => {
  try {
    const startTime = Date.now();
    await redisClient.ping();
    const latency = Date.now() - startTime;
    
    res.status(200).json({
      status: 'ok',
      redis: {
        status: 'connected',
        latency: `${latency}ms`
      },
      services: {
        database: 'redis',
        farcaster: !!process.env.NEYNAR_API_KEY ? 'configured' : 'missing'
      },
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime().toFixed(2) + 's'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      redis: 'disconnected',
      error: error.message,
      action: 'Check REDIS_URL configuration'
    });
  }
};
