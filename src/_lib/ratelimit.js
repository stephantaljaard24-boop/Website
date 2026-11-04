// Simple fixed-window rate limiter. Uses the CHAT_KV namespace when bound,
// otherwise falls back to per-isolate memory (best effort).
const memory = new Map();

export async function rateLimit(env, key, limit, windowSeconds) {
  const bucket = Math.floor(Date.now() / 1000 / windowSeconds);
  const k = `rl:${key}:${bucket}`;

  if (env.CHAT_KV) {
    const current = parseInt((await env.CHAT_KV.get(k)) || '0', 10);
    if (current >= limit) return false;
    await env.CHAT_KV.put(k, String(current + 1), { expirationTtl: Math.max(60, windowSeconds * 2) });
    return true;
  }

  const current = memory.get(k) || 0;
  if (current >= limit) return false;
  memory.set(k, current + 1);
  if (memory.size > 5000) memory.clear();
  return true;
}
