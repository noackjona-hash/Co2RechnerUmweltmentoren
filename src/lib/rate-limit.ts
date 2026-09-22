/**
 * High-performance sliding-window in-memory Rate Limiter
 * Blocks automated credential-stuffing, code brute-forcing, and DDoS attacks.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 600000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 300000);
}

export interface RateLimitOptions {
  limit: number;      // Maximum allowed requests in window
  windowMs: number;   // Window duration in milliseconds (e.g. 60_000 for 1 minute)
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;      // Epoch time in ms when limit resets
}

/**
 * Checks if an identifier (e.g. IP + route) has exceeded the rate limit.
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 15, windowMs: 60000 }
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  let record = rateLimitStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  // Filter timestamps within current window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= options.limit) {
    const earliestTimestamp = record.timestamps[0] || now;
    const reset = earliestTimestamp + options.windowMs;
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      reset,
    };
  }

  // Record this request
  record.timestamps.push(now);

  const reset = now + options.windowMs;
  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - record.timestamps.length,
    reset,
  };
}
