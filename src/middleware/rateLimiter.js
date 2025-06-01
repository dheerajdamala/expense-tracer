import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    console.log(`Rate limiting request: ${req.method} ${req.url}`);
    const { success, limit, reset, remaining } = await ratelimit.limit("my-rate-limit");

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', reset);

    if (!success) {
      console.log(`Rate limit exceeded for ${req.ip}`);
      return res.status(429).json({ 
        error: 'Too many requests, please try again later.',
        reset_at: new Date(reset).toISOString()
      });
    }
    
    console.log(`Rate limit remaining: ${remaining}/${limit}`);
    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    // Don't block the request if rate limiting fails
    next();
  }
}

export default rateLimiter;