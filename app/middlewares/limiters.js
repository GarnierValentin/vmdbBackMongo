import { rateLimit } from 'express-rate-limit';

const defaultSettings = {
  standardHeaders: true,
  legacyHeaders: false,
};

const inMemoryStore = {};

const inMemoryRateLimiter = (options) => {
  const { windowMs, limit, prefix } = options;
  const store = inMemoryStore[prefix] || (inMemoryStore[prefix] = {});
  
  return rateLimit({
    windowMs,
    max: limit,
    ...defaultSettings,
    keyGenerator: (req) => req.ip,
    handler: (req, res, next, options) => {
      const key = req.ip;
      const currentTime = Date.now();
      const windowEnd = store[key]?.startTime + windowMs;
      
      if (store[key] && currentTime < windowEnd) {
        store[key].count += 1;
      } else {
        store[key] = { count: 1, startTime: currentTime };
      }
      
      if (store[key].count > limit) {
        res.status(options.statusCode).send(options.message);
      } else {
        next();
      }
    }
  });
};

export const globalLimiter = inMemoryRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 400, // Limit each IP to 400 requests per window (here, per 15 minutes)
  prefix: 'rl-global:',
});

export const loginLimiter = inMemoryRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  limit: 50, // Limit each IP to 10 requests per window (here, per 1 minute)
  prefix: 'rl-login:',
  handler: (request, response, next, options) => {
    if (request.rateLimit.current === request.rateLimit.limit + 1) {
      response.status(200).send(options.message);
    } else {
      response.status(options.statusCode).send(options.message);
    }
  }
});
