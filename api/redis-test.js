const { redisClient } = require('../lib/redis');

module.exports = async (req, res) => {
  try {
    // Test connection
    await redisClient.ping();
    
    // Test read/write
    await redisClient.setEx('test_key', 10, 'test_value');
    const value = await redisClient.get('test_key');
    
    res.status(200).json({
      success: true,
      message: 'Redis is working!',
      test_value: value
    });
  } catch (error) {
    console.error('Redis test error:', error);
    res.status(500).json({
      success: false,
      error: 'Redis connection failed',
      details: error.message,
      redis_url: process.env.REDIS_URL
    });
  }
};
