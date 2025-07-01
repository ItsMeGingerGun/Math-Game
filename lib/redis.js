// Update lib/redis.js
const { createClient } = require('redis');

module.exports = () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) throw new Error('REDIS_URL not set');
  
  const url = new URL(redisUrl);
  
  const client = createClient({
    socket: {
      host: url.hostname,
      port: url.port,
      tls: true,
      rejectUnauthorized: false
    },
    username: url.username,
    password: url.password
  });

  client.on('error', err => console.error('Redis Client Error', err));
  
  client.connect()
    .then(() => console.log('Redis connected'))
    .catch(err => console.error('Redis connection failed:', err));
  
  return client;
};
