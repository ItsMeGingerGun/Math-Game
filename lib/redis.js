const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
    connectTimeout: 10000, // 10 seconds timeout
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        console.log("Too many retries. Connection terminated");
        return new Error("Could not connect to Redis");
      }
      return Math.min(retries * 200, 1000); // Reconnect after 200ms, 400ms, ..., max 1s
    }
  }
});

// Add detailed event listeners
redisClient.on('connect', () => console.log('Redis connecting...'));
redisClient.on('ready', () => console.log('Redis connected!'));
redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('end', () => console.log('Redis disconnected'));
redisClient.on('reconnecting', () => console.log('Redis reconnecting...'));

// Connect with error handling
redisClient.connect()
  .then(() => console.log('Redis connected successfully'))
  .catch(err => {
    console.error('Redis connection failed:', err);
    console.error('Redis URL used:', process.env.REDIS_URL);
  });

module.exports = { redisClient };
