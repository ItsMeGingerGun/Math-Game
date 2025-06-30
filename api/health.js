module.exports = (req, res) => {
  res.json({
    status: 'ok',
    redis: typeof client !== 'undefined' ? 'connected' : 'disconnected',
    env: {
      REDIS_URL: !!process.env.REDIS_URL,
      NEYNAR_API_KEY: !!process.env.NEYNAR_API_KEY
    }
  });
};
