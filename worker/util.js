// Small helpers shared by the booking and order routes
export const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});
export const fail = (error, message, status = 400, extra = {}) => json({ ok: false, error, message, ...extra }, status);

export const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !Number.isNaN(Date.parse(s + 'T00:00:00Z'));
export const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, max);

export function newCode(prefix, length = 5) {
  const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return prefix + [...bytes].map((x) => abc[x % abc.length]).join('');
}

// JSON only: a plain cross-site form post can't send this content type, so other sites can't book or order for a visitor
export async function readBody(request) {
  if (!(request.headers.get('content-type') || '').includes('application/json')) return null;
  try { return await request.json(); } catch { return null; }
}

// Cloudflare rate limit binding (see wrangler.toml). True when this caller is over the limit; never blocks if the binding is missing.
export async function overLimit(limiter, request, scope) {
  if (!limiter) return false;
  const ip = request.headers.get('cf-connecting-ip') || 'local';
  try { return !(await limiter.limit({ key: `${scope}:${ip}` })).success; } catch { return false; }
}
