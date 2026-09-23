import type { NextRequest, NextResponse } from 'next/server';

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding-window store mapping identifier -> timestamps
const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodically clean up records older than 10 minutes to avoid memory leaks
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredRecords(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  rateLimitStore.forEach((record, key) => {
    const valid = record.timestamps.filter((t: number) => now - t < windowMs);
    if (valid.length === 0) {
      rateLimitStore.delete(key);
    } else {
      record.timestamps = valid;
    }
  });
}


export interface RateLimitOptions {
  /**
   * Maximum allowed requests within the time window.
   * Default: 30 requests.
   */
  limit?: number;
  /**
   * Sliding time window duration in milliseconds.
   * Default: 60,000ms (1 minute).
   */
  windowMs?: number;
  /**
   * Custom identifier extractor (e.g. User ID or IP).
   */
  keyGenerator?: (req: NextRequest) => string;
}

/**
 * Extracts a client identifier from IP headers or fallback.
 */
export function getClientIp(req: NextRequest): string {
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

/**
 * Checks if the incoming request exceeds the configured rate limit.
 * Returns null if allowed, or a 429 NextResponse with standard Retry-After headers if throttled.
 */
export function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions = {}
): NextResponse | null {
  const limit = options.limit ?? 30;
  const windowMs = options.windowMs ?? 60 * 1000;
  const identifier = options.keyGenerator
    ? options.keyGenerator(req)
    : `${req.nextUrl.pathname}:${getClientIp(req)}`;

  const now = Date.now();
  cleanupExpiredRecords(windowMs);

  let record = rateLimitStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  // Filter timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0];
    const retryAfterSec = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000));

    return Response.json(
      {
        success: false,
        error: `Too many requests. Rate limit exceeded (${limit} requests per ${Math.round(windowMs / 1000)}s). Please try again in ${retryAfterSec} seconds.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSec),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil((oldestTimestamp + windowMs) / 1000)),
        },
      }
    ) as unknown as NextResponse;

  }

  // Record this request
  record.timestamps.push(now);
  return null;
}
