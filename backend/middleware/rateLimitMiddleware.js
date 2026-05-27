/**
 * Simple in-memory rate limiter middleware
 * NOTE: For multi-instance production, use redis + express-rate-limit package.
 * This implementation includes memory leak prevention via periodic cleanup.
 */
const hits = new Map();

// Periodic cleanup: remove expired entries every 5 minutes (#35 — was leaking memory)
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of hits.entries()) {
    if (now > entry.reset) {
      hits.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Allow cleanup to not block process exit
if (cleanupInterval.unref) cleanupInterval.unref();

const rateLimit = ({ windowMs = 60 * 1000, max = 60 } = {}) => (req, res, next) => {
  try {
    const now = Date.now();
    const key = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

    const entry = hits.get(key) || { count: 0, reset: now + windowMs };

    if (now > entry.reset) {
      entry.count = 1;
      entry.reset = now + windowMs;
    } else {
      entry.count += 1;
    }

    hits.set(key, entry);

    res.set('X-RateLimit-Limit', String(max));
    res.set('X-RateLimit-Remaining', String(Math.max(0, max - entry.count)));
    res.set('X-RateLimit-Reset', String(Math.ceil((entry.reset - now) / 1000)));

    if (entry.count > max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.',
      });
    }

    next();
  } catch (err) {
    // Fail open — don't block requests if rate limiter crashes
    next();
  }
};

module.exports = rateLimit;
