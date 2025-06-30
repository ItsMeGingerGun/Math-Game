const { createClient } = require('redis');

const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false
  }
});

// Remove the config import and connect directly
client.connect()
  .then(() => console.log('Redis connected'))
  .catch(err => console.error('Redis connection error:', err));

module.exports = { client };
