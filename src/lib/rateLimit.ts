import { NeonQueryFunction } from "@neondatabase/serverless";

const WINDOW_MS = 60_000; // 1-minute window
const MAX_REQUESTS = 5;   // max attempts per IP per window

// Fallback in-memory store — used if DB table doesn't exist yet
const memStore = new Map<string, { count: number; resetAt: number }>();

function memRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = memStore.get(ip);
  if (!entry || now > entry.resetAt) {
    memStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_REQUESTS) return true;
  entry.count++;
  return false;
}

// DB-backed rate limiter — works across serverless instances.
// Requires: CREATE TABLE IF NOT EXISTS rate_limits (
//   ip TEXT PRIMARY KEY, count INT NOT NULL DEFAULT 1, reset_at TIMESTAMPTZ NOT NULL
// );
// Falls back to in-memory if the table doesn't exist.
export async function isRateLimited(ip: string, sql: NeonQueryFunction<false, false>): Promise<boolean> {
  try {
    const resetAt = new Date(Date.now() + WINDOW_MS).toISOString();
    const result = await sql`
      INSERT INTO rate_limits (ip, count, reset_at)
      VALUES (${ip}, 1, ${resetAt})
      ON CONFLICT (ip) DO UPDATE SET
        count    = CASE WHEN rate_limits.reset_at < NOW() THEN 1 ELSE rate_limits.count + 1 END,
        reset_at = CASE WHEN rate_limits.reset_at < NOW() THEN ${resetAt} ELSE rate_limits.reset_at END
      RETURNING count
    `;
    return (result[0].count as number) > MAX_REQUESTS;
  } catch {
    // Table not created yet — fall back to in-memory
    return memRateLimit(ip);
  }
}
