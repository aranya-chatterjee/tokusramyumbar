// Toku's booking API. Static files are served from the repo root; only /api/* reaches this code.
import { CONFIG, slotTimes, slotLabel, nowLocal, addDays } from './config.js';
import { notifyStaff } from './notify.js';

const ACTIVE = "status IN ('confirmed', 'arrived')";

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});
const fail = (error, message, status = 400, extra = {}) => json({ ok: false, error, message, ...extra }, status);

const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !Number.isNaN(Date.parse(s + 'T00:00:00Z'));
const toMin = (t) => +t.slice(0, 2) * 60 + +t.slice(3);
const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, max);

function normalisePhone(raw) {
  let d = String(raw ?? '').replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  if (d.length === 10) d = '91' + d;
  return d.length >= 11 && d.length <= 13 ? d : null;
}

function newCode() {
  const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return 'TK-' + [...bytes].map((x) => abc[x % abc.length]).join('');
}

// Why a date cannot be booked online, or null when it can
function dateProblem(date) {
  const today = nowLocal().date;
  if (!isDate(date)) return 'Pick a valid date.';
  if (date < today) return 'That date has passed.';
  if (date > addDays(today, CONFIG.daysAhead)) return `You can book up to ${CONFIG.daysAhead} days ahead.`;
  if (CONFIG.closedWeekdays.includes(new Date(date + 'T00:00:00Z').getUTCDay())) return 'We are closed that day.';
  return null;
}

async function seatsTaken(env, date) {
  const { results } = await env.DB.prepare(
    `SELECT slot, SUM(guests) AS taken FROM bookings WHERE date = ? AND ${ACTIVE} GROUP BY slot`
  ).bind(date).all();
  return Object.fromEntries(results.map((r) => [r.slot, r.taken]));
}

async function getSlots(env, url) {
  const date = url.searchParams.get('date');
  const problem = dateProblem(date);
  const base = { date, maxGroup: CONFIG.maxGroup, seatsPerSlot: CONFIG.seatsPerSlot };
  if (problem) return json({ ...base, closed: problem, slots: [] });
  const taken = await seatsTaken(env, date);
  const now = nowLocal();
  const slots = slotTimes().map((t) => {
    const left = Math.max(0, CONFIG.seatsPerSlot - (taken[t] || 0));
    const tooSoon = date === now.date && toMin(t) < now.minutes + CONFIG.leadMinutes;
    return { time: t, label: slotLabel(t), left, open: !tooSoon && left > 0 };
  });
  return json({ ...base, slots });
}

async function readBody(request) {
  try { return await request.json(); } catch { return null; }
}

// Inserts only if the slot still has room, in one statement, so two guests can't take the last seats at once
async function insertBooking(env, b, enforceCapacity) {
  const cap = enforceCapacity ? CONFIG.seatsPerSlot : 1e9;
  for (let attempt = 0; attempt < 3; attempt++) {
    b.code = newCode();
    try {
      const res = await env.DB.prepare(
        `INSERT INTO bookings (code, name, phone, date, slot, guests, note, source)
         SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8
         WHERE (SELECT COALESCE(SUM(guests), 0) FROM bookings WHERE date = ?4 AND slot = ?5 AND ${ACTIVE}) + ?6 <= ?9`
      ).bind(b.code, b.name, b.phone, b.date, b.slot, b.guests, b.note, b.source, cap).run();
      return res.meta.changes === 1;
    } catch (e) {
      if (!String(e).includes('UNIQUE')) throw e; // code clash: try another code
    }
  }
  throw new Error('could not make a booking code');
}

function readBooking(body, { staff }) {
  if (!body) return { error: fail('bad_request', 'Send the booking as JSON.') };
  const b = {
    name: clean(body.name, 60),
    phone: normalisePhone(body.phone),
    date: String(body.date || ''),
    slot: String(body.time || ''),
    guests: parseInt(body.guests, 10),
    note: clean(body.note, 200),
    source: staff ? 'staff' : 'web',
  };
  if (!b.name) return { error: fail('name', 'Please tell us your name.') };
  if (!b.phone) return { error: fail('phone', 'Please give a 10 digit mobile number.') };
  if (!staff) {
    const problem = dateProblem(b.date);
    if (problem) return { error: fail('date', problem) };
  } else if (!isDate(b.date)) return { error: fail('date', 'Pick a valid date.') };
  if (!slotTimes().includes(b.slot)) return { error: fail('time', 'Pick one of the listed times.') };
  if (!(b.guests >= 1) || (!staff && b.guests > CONFIG.maxGroup) || b.guests > 60) {
    return { error: fail('guests', `Online bookings are for up to ${CONFIG.maxGroup} guests. Message us on WhatsApp for bigger groups.`) };
  }
  return { b };
}

async function createBooking(env, request, ctx) {
  const body = await readBody(request);
  if (body && body.website) return json({ ok: true, code: 'TK-THANKS' }); // honeypot field filled in: a bot
  const { b, error } = readBooking(body, { staff: false });
  if (error) return error;

  const now = nowLocal();
  if (b.date === now.date && toMin(b.slot) < now.minutes + CONFIG.leadMinutes) {
    return fail('time', 'That time is too soon to book online. Please call us.');
  }
  const { n } = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM bookings WHERE phone = ? AND date >= ? AND status = 'confirmed'`
  ).bind(b.phone, now.date).first();
  if (n >= CONFIG.maxActivePerPhone) {
    return fail('limit', 'This number already has several upcoming bookings. Please call us to add more.', 429);
  }

  if (!(await insertBooking(env, b, true))) {
    const left = Math.max(0, CONFIG.seatsPerSlot - ((await seatsTaken(env, b.date))[b.slot] || 0));
    return fail('full', left ? `Only ${left} ${left === 1 ? 'seat is' : 'seats are'} left at ${slotLabel(b.slot)}.` : `${slotLabel(b.slot)} is fully booked. Try another time.`, 409, { left });
  }
  ctx.waitUntil(notifyStaff(env, b));
  return json({ ok: true, code: b.code, name: b.name, date: b.date, time: b.slot, label: slotLabel(b.slot), guests: b.guests }, 201);
}

// ---- staff ----

function staffAllowed(env, request) {
  const pin = env.STAFF_PIN;
  const given = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!pin || given.length !== pin.length) return false;
  let diff = 0;
  for (let i = 0; i < pin.length; i++) diff |= pin.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

async function staffList(env, url) {
  const date = url.searchParams.get('date') || nowLocal().date;
  if (!isDate(date)) return fail('date', 'Pick a valid date.');
  const { results } = await env.DB.prepare(
    `SELECT id, code, name, phone, date, slot, guests, note, source, status, created_at
     FROM bookings WHERE date = ? ORDER BY slot, created_at`
  ).bind(date).all();
  const taken = await seatsTaken(env, date);
  const slots = slotTimes().map((t) => ({ time: t, label: slotLabel(t), taken: taken[t] || 0, seats: CONFIG.seatsPerSlot }));
  return json({ ok: true, date, slots, bookings: results.map((r) => ({ ...r, label: slotLabel(r.slot) })) });
}

async function staffSetStatus(env, request) {
  const body = await readBody(request);
  const status = body && body.status;
  if (!['confirmed', 'arrived', 'no_show', 'cancelled'].includes(status)) return fail('status', 'Unknown status.');
  const res = await env.DB.prepare('UPDATE bookings SET status = ? WHERE id = ?').bind(status, +body.id).run();
  return res.meta.changes ? json({ ok: true }) : fail('missing', 'No such booking.', 404);
}

async function staffAdd(env, request) {
  const body = await readBody(request);
  const { b, error } = readBooking(body, { staff: true });
  if (error) return error;
  const ok = await insertBooking(env, b, !body.force);
  if (!ok) return fail('full', `${slotLabel(b.slot)} would go over ${CONFIG.seatsPerSlot} seats. Tick "Allow over capacity" to add it anyway.`, 409);
  return json({ ok: true, code: b.code }, 201);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const route = `${request.method} ${url.pathname.replace(/\/+$/, '')}`;
    try {
      switch (route) {
        case 'GET /api/slots': return await getSlots(env, url);
        case 'POST /api/book': return await createBooking(env, request, ctx);
      }
      if (url.pathname.startsWith('/api/staff/')) {
        if (!staffAllowed(env, request)) return fail('pin', 'Wrong staff PIN.', 401);
        switch (route) {
          case 'GET /api/staff/bookings': return await staffList(env, url);
          case 'POST /api/staff/status': return await staffSetStatus(env, request);
          case 'POST /api/staff/add': return await staffAdd(env, request);
        }
      }
      if (url.pathname.startsWith('/api/')) return fail('not_found', 'Not found.', 404);
      return env.ASSETS.fetch(request);
    } catch (e) {
      console.error(e);
      return fail('server', 'Something went wrong on our side. Please message us on WhatsApp.', 500);
    }
  },
};
