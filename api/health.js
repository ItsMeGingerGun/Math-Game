import { createClient } from 'redis';

export default async (req, res) => {
  const start = Date.now();
  
  try {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) throw new Error('REDIS_URL not set');
    
    const client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 2000,
        tls: true,
        rejectUnauthorized: false
      }
    });
    
    await client.connect();
    await client.ping();
    const latency = Date.now() - start;
    await client.quit();
    
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      status: 'ok',
      redis: 'connected',
      latency: `${latency}ms`,
      environment: process.env.VERCEL_ENV || 'development'
    });
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).json({
      status: 'error',
      error: error.message,
      solution: 'Check Redis configuration and Vercel env variables'
    });
  }
};
