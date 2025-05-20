const redisClient = require('../services/redisClient');

const RATE_LIMIT_PREFIX = 'rate_limit:';
const RATE_LIMIT_WINDOW_SECONDS = 60; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 10;   // max 10 requests per window

async function rateLimiter(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ message: 'API key required' });
  }

  const redisKey = `${RATE_LIMIT_PREFIX}${apiKey}`;

  try {
    const currentCount = await redisClient.incr(redisKey);

    if (currentCount === 1) {
      await redisClient.expire(redisKey, RATE_LIMIT_WINDOW_SECONDS);
    }

    if (currentCount > RATE_LIMIT_MAX_REQUESTS) {
      return res.status(429).json({ message: 'Too many requests' });
    }

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = rateLimiter;
