/**
 * Simple fixed-window rate limiter for public forms. In-memory, so it applies per server
 * instance; on multi-instance hosting swap this for a shared store such as Redis/Upstash.
 */

const buckets = new Map<string, { count: number; resetAt: number }>()

export interface RateLimitResult {
  ok: boolean
  retryAfterSeconds: number
}

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitResult {
  const b = buckets.get(key)
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    if (buckets.size > 10000) prune(now)
    return { ok: true, retryAfterSeconds: 0 }
  }
  b.count++
  if (b.count > limit) return { ok: false, retryAfterSeconds: Math.ceil((b.resetAt - now) / 1000) }
  return { ok: true, retryAfterSeconds: 0 }
}

function prune(now: number) {
  for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k)
}

export function resetRateLimits() {
  buckets.clear()
}
