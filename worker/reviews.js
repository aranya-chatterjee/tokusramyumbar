// Guest ratings for the note wall: a star rating plus a short post-it, shown to every visitor.
import { json, fail, clean, readBody } from './util.js';
import { nowLocal } from './config.js';

const WALL_SIZE = 9;     // notes the home page shows
const PER_DAY = 3;       // notes one connection can stick per day
const STATUSES = ['shown', 'pending', 'hidden'];

// Stored instead of the raw IP: enough to count notes per connection, not enough to identify anyone
async function visitorKey(request) {
  const ip = request.headers.get('cf-connecting-ip') || 'local';
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('tokus-wall:' + ip)));
  return [...bytes.slice(0, 12)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function summary(env) {
  const { results } = await env.DB.prepare(
    `SELECT stars, COUNT(*) AS n FROM reviews WHERE status = 'shown' GROUP BY stars`
  ).all();
  const counts = [0, 0, 0, 0, 0];
  let total = 0, sum = 0;
  for (const r of results) { counts[r.stars - 1] = r.n; total += r.n; sum += r.stars * r.n; }
  return { count: total, average: total ? Math.round((sum / total) * 10) / 10 : null, counts };
}

export async function getWall(env) {
  const { results } = await env.DB.prepare(
    `SELECT id, stars, note, name, created_at FROM reviews WHERE status = 'shown' ORDER BY id DESC LIMIT ?`
  ).bind(WALL_SIZE).all();
  return json({ ok: true, ...(await summary(env)), notes: results });
}

export async function addReview(env, request) {
  const body = await readBody(request);
  if (!body) return fail('bad_request', 'Send the note as JSON.');
  if (body.website) return json({ ok: true, status: 'shown' }); // honeypot field filled in: a bot
  const stars = parseInt(body.stars, 10);
  const note = clean(body.note, 80);
  const name = clean(body.name, 24);
  if (!(stars >= 1 && stars <= 5)) return fail('stars', 'Tap the stars to rate your visit.');
  if (!note) return fail('note', 'Write something first, even just "send noods".');
  if (/https?:|www\.|\.(com|in|net|org|xyz|io)\b|@\w/i.test(note + ' ' + name)) return fail('note', 'Links and handles can\'t go on the wall.');

  const status = env.REVIEWS_HOLD === '1' ? 'pending' : 'shown';
  const who = await visitorKey(request);
  const day = nowLocal().date;
  // One statement, so a fast double tap or a script can't slip past the daily cap or post the same note twice
  const res = await env.DB.prepare(
    `INSERT INTO reviews (stars, note, name, status, who, day)
     SELECT ?1, ?2, ?3, ?4, ?5, ?6
     WHERE (SELECT COUNT(*) FROM reviews WHERE who = ?5 AND day = ?6) < ?7
       AND NOT EXISTS (SELECT 1 FROM reviews WHERE who = ?5 AND note = ?2)`
  ).bind(stars, note, name, status, who, day, PER_DAY).run();
  if (res.meta.changes !== 1) {
    const same = await env.DB.prepare('SELECT 1 FROM reviews WHERE who = ? AND note = ?').bind(who, note).first();
    if (same) return json({ ok: true, status, repeat: true });
    return fail('limit', `That's ${PER_DAY} notes today. Come back tomorrow, or stick a real one at the wall.`, 429);
  }
  return json({ ok: true, status, ...(await summary(env)) }, 201);
}

// ---- staff ----

export async function staffReviews(env, url) {
  const status = url.searchParams.get('status');
  const filter = STATUSES.includes(status) ? 'WHERE status = ?' : '';
  const stmt = env.DB.prepare(
    `SELECT id, stars, note, name, status, created_at FROM reviews ${filter} ORDER BY id DESC LIMIT 200`
  );
  const { results } = await (filter ? stmt.bind(status) : stmt).all();
  const { results: tally } = await env.DB.prepare('SELECT status, COUNT(*) AS n FROM reviews GROUP BY status').all();
  return json({ ok: true, ...(await summary(env)), byStatus: Object.fromEntries(tally.map((t) => [t.status, t.n])), reviews: results });
}

export async function setReviewStatus(env, request) {
  const body = await readBody(request);
  if (!body || !Number.isInteger(+body.id)) return fail('missing', 'No such note.', 404);
  const res = body.status === 'deleted'
    ? await env.DB.prepare('DELETE FROM reviews WHERE id = ?').bind(+body.id).run()
    : STATUSES.includes(body.status)
      ? await env.DB.prepare('UPDATE reviews SET status = ? WHERE id = ?').bind(body.status, +body.id).run()
      : null;
  if (!res) return fail('status', 'Unknown status.');
  if (!res.meta.changes) return fail('missing', 'No such note.', 404);
  return json({ ok: true });
}
