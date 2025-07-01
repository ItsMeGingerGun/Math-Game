const { createClient } = require('redis');

module.exports = () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) throw new Error('REDIS_URL environment variable not set');
  
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL === '1';
  
  console.log(`Connecting to Redis at ${isVercel ? '[hidden]' : redisUrl}`);
  
  const client = createClient({
    url: redisUrl,
    socket: {
      connectTimeout: 5000,
      reconnectStrategy: (retries) => Math.min(retries * 200, 3000),
      ...(isProduction && {
        tls: true,
        rejectUnauthorized: false
      })
    }
  });

  client.on('error', err => console.error('Redis Client Error:', err));
  
  // Vercel-specific: Connect but don't block startup
  if (isVercel) {
    client.connect()
      .then(() => console.log('Redis connected successfully (Vercel)'))
      .catch(err => console.error('Redis connection failed:', err));
  } else {
    client.connect()
      .then(() => console.log('Redis connected successfully'))
      .catch(err => console.error('Redis connection failed:', err));
  }
  
  return client;
};
