import rateLimit from 'express-rate-limit';

// General API limiter (applies to all routes)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

// Strict limiter for betting actions
export const bettingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 bets per minute per IP
  message: 'Too many bets. Please slow down.',
  skipSuccessfulRequests: false, // Count all requests
});

// Admin actions limiter
export const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 admin actions per minute
  message: 'Too many admin actions. Please slow down.',
});

// Table creation limiter
export const tableCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 tables per hour per IP
  message: 'Too many tables created. Please wait before creating another.',
});

// Heartbeat limiter (very lenient)
export const heartbeatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 heartbeats per minute (you send every 30s, so this is safe)
  message: 'Too many heartbeat requests.',
});

