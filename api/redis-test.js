const { createClient } = require('redis');

module.exports = async (req, res) => {
  try {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      return res.status(500).json({
        success: false,
        error: 'REDIS_URL not configured'
      });
    }

    const client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        ...(process.env.NODE_ENV === 'production' && {
          tls: true,
          rejectUnauthorized: false
        })
      }
    });

    await client.connect();
    
    // Test write
    const setStart = Date.now();
    await client.set('vercel_test_key', 'hello_vercel', { EX: 60 });
    const setTime = Date.now() - setStart;
    
    // Test read
    const getStart = Date.now();
    const value = await client.get('vercel_test_key');
    const getTime = Date.now() - getStart;
    
    // Test TTL
    const ttl = await client.ttl('vercel_test_key');
    
    await client.quit();

    res.status(200).json({
      success: true,
      tests: {
        write: `${setTime}ms`,
        read: `${getTime}ms`,
        ttl: `${ttl}s remaining`
      },
      value: value,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Redis test error:', error);
    res.status(500).json({
      success: false,
      error: error.code || 'CONNECTION_FAILED',
      message: error.message,
      solution: process.env.NODE_ENV === 'production' 
        ? 'Ensure TLS is enabled and Vercel IPs are whitelisted' 
        : 'Check local Redis server'
    });
  }
};
