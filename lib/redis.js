const { createClient } = require('redis');

module.exports = () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) throw new Error('REDIS_URL environment variable not set');
  
  const isProduction = process.env.NODE_ENV === 'production';
  const url = new URL(redisUrl);
  
  console.log(`Connecting to Redis at ${isProduction ? url.hostname : redisUrl}`);
  
  const client = createClient({
    url: redisUrl,
    socket: {
      connectTimeout: 5000,
      reconnectStrategy: (retries) => Math.min(retries * 200, 3000),
      ...(isProduction ? {
        tls: true,
        rejectUnauthorized: false
      } : {})
    }
  });

  client.on('error', err => console.error('Redis Client Error:', err));
  client.on('connect', () => console.log('Redis connecting...'));
  client.on('ready', () => console.log('Redis ready'));
  client.on('reconnecting', () => console.log('Redis reconnecting'));
  
  // Connect immediately
  client.connect()
    .then(() => console.log('Redis connected successfully'))
    .catch(err => console.error('Redis connection failed:', err));
  
  return client;
};
