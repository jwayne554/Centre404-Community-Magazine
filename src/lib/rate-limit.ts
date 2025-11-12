import { NextRequest, NextResponse } from 'next/server';

/**
 * In-memory rate limiter using sliding window algorithm
 * Suitable for single-instance deployments (Railway, Vercel, etc.)
 * For multi-instance deployments, consider Redis-based solution (@upstash/ratelimit)
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  requests: number;
  windowMs: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (entry.resetAt < now) {
          this.store.delete(key);
        }
      }
    }, 60000);
  }

  /**
   * Check if request should be rate limited
   * @param identifier Unique identifier (IP address, user ID, etc.)
   * @param config Rate limit configuration
   * @returns Result with success/failure and remaining info
   */
  check(
    identifier: string,
    config: RateLimitConfig
  ): {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // No entry or expired - create new
    if (!entry || entry.resetAt < now) {
      const resetAt = now + config.windowMs;
      this.store.set(identifier, { count: 1, resetAt });
      return {
        success: true,
        limit: config.requests,
        remaining: config.requests - 1,
        reset: resetAt,
      };
    }

    // Increment count
    entry.count++;

    // Check if exceeded
    if (entry.count > config.requests) {
      return {
        success: false,
        limit: config.requests,
        remaining: 0,
        reset: entry.resetAt,
      };
    }

    return {
      success: true,
      limit: config.requests,
      remaining: config.requests - entry.count,
      reset: entry.resetAt,
    };
  }

  cleanup() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

/**
 * Rate limit configurations for different endpoint types
 */
export const rateLimitConfigs = {
  // Authentication endpoints - prevent brute force
  auth: {
    requests: 5,
    windowMs: 60 * 1000, // 5 requests per minute
  },
  // Registration - prevent spam accounts
  register: {
    requests: 3,
    windowMs: 60 * 60 * 1000, // 3 registrations per hour
  },
  // File uploads - prevent resource exhaustion
  upload: {
    requests: 10,
    windowMs: 60 * 60 * 1000, // 10 uploads per hour
  },
  // Submissions - prevent spam
  submission: {
    requests: 20,
    windowMs: 60 * 60 * 1000, // 20 submissions per hour
  },
  // TTS API - prevent quota abuse
  tts: {
    requests: 100,
    windowMs: 24 * 60 * 60 * 1000, // 100 TTS requests per day
  },
  // General API - reasonable default
  api: {
    requests: 100,
    windowMs: 60 * 1000, // 100 requests per minute
  },
};

/**
 * Get client identifier from request (IP address or user ID)
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get authenticated user ID first (more accurate)
  const userId = request.headers.get('x-user-id');
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
  return `ip:${ip}`;
}

/**
 * Middleware helper to apply rate limiting to a route handler
 * Returns null if rate limit passed, or NextResponse with 429 if exceeded
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const identifier = getClientIdentifier(request);
  const result = rateLimiter.check(identifier, config);

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': new Date(result.reset).toISOString(),
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }

  // Rate limit passed - return null to continue
  return null;
}

/**
 * Convenience functions for common rate limits
 */
export const rateLimit = {
  auth: (request: NextRequest) => checkRateLimit(request, rateLimitConfigs.auth),
  register: (request: NextRequest) => checkRateLimit(request, rateLimitConfigs.register),
  upload: (request: NextRequest) => checkRateLimit(request, rateLimitConfigs.upload),
  submission: (request: NextRequest) => checkRateLimit(request, rateLimitConfigs.submission),
  tts: (request: NextRequest) => checkRateLimit(request, rateLimitConfigs.tts),
  api: (request: NextRequest) => checkRateLimit(request, rateLimitConfigs.api),
};

// Cleanup on process termination
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => rateLimiter.cleanup());
  process.on('SIGINT', () => rateLimiter.cleanup());
}
