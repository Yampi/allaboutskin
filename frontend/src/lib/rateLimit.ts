/**
 * Rate Limiter for Serverless Endpoints (Vercel & Next.js)
 * Protects AI API keys from quota exhaustion, scraping, and abusive loops.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory tracker for serverless instances
const ipRateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of ipRateLimitMap.entries()) {
    if (value.resetAt < now) {
      ipRateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  limit?: number; // max requests
  windowMs?: number; // time window in ms (default: 60s)
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const limit = options.limit || 20; // 20 requests per minute by default
  const windowMs = options.windowMs || 60 * 1000;
  const now = Date.now();

  const record = ipRateLimitMap.get(identifier);

  if (!record || record.resetAt < now) {
    ipRateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1, resetInSeconds: Math.ceil(windowMs / 1000) };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetInSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
  };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
