const { createClient } = require('redis');

module.exports = async (req, res) => {
  try {
    const redisUrl = process.env.REDIS_URL;
    console.log('Using Redis URL:', redisUrl);
    
    // Parse URL for debugging (don't log full URL in production)
    const urlObj = new URL(redisUrl);
    const safeUrl = `rediss://${urlObj.hostname}:${urlObj.port}`;
    console.log('Redis connection to:', safeUrl);
    
    const client = createClient({
      url: redisUrl,
      socket: {
        tls: true,
        rejectUnauthorized: false,
        connectTimeout: 10000
      }
    });
    
    await client.connect();
    await client.set('test_key', 'test_value', 10);
    const value = await client.get('test_key');
    await client.quit();
    
    res.status(200).json({
      success: true,
      message: 'Redis test successful!',
      test_value: value
    });
  } catch (error) {
    console.error('Redis test error:', error);
    res.status(500).json({
      success: false,
      error: 'Redis test failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
