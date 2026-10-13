import { NextResponse } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory cache for sliding window rate limiting
const ipRateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale IP records every 5 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of ipRateLimitStore.entries()) {
      if (now > record.resetTime) {
        ipRateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Extract client IP address from various standard HTTP headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  return "127.0.0.1";
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  total: number;
  retryAfterSeconds: number;
}

/**
 * Checks and updates rate limit for a given key and action prefix.
 * @param key Unique identifier (e.g., client IP or User ID)
 * @param actionPrefix Action category (e.g., 'copilot_chat', 'tracer_submit')
 * @param limit Maximum allowed requests within windowMs
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(
  key: string,
  actionPrefix: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const storeKey = `${actionPrefix}:${key}`;
  const existing = ipRateLimitStore.get(storeKey);

  if (!existing || now > existing.resetTime) {
    // Window expired or new key
    ipRateLimitStore.set(storeKey, {
      count: 1,
      resetTime: now + windowMs,
    });

    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: now + windowMs,
      total: limit,
      retryAfterSeconds: 0,
    };
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetTime - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetTime: existing.resetTime,
      total: limit,
      retryAfterSeconds,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetTime: existing.resetTime,
    total: limit,
    retryAfterSeconds: 0,
  };
}

/**
 * Standard HTTP 429 response helper with RFC 6585 and RateLimit standard headers.
 */
export function createRateLimitExceededResponse(
  retryAfterSeconds: number,
  customMessage?: string
): NextResponse {
  const message =
    customMessage ||
    `Terlalu banyak permintaan. Demi keamanan sistem, silakan tunggu ${retryAfterSeconds} detik sebelum mencoba kembali.`;

  return NextResponse.json(
    {
      success: false,
      error: message,
      retryAfter: retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000) + retryAfterSeconds),
      },
    }
  );
}
