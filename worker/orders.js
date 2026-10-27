// Table ordering: guests order from /order/?table=N, staff follow orders on /staff/
import { CONFIG, nowLocal } from './config.js';
import { CATEGORIES, MENU, MENU_BY_ID } from './menu.js';
import { json, fail, isDate, clean, newCode, readBody } from './util.js';

const STATUSES = ['new', 'preparing', 'served', 'paid', 'cancelled'];
const tableNames = () => Array.from({ length: CONFIG.tables }, (_, i) => String(i + 1));

async function soldOutIds(env) {
  const { results } = await env.DB.prepare('SELECT item_id FROM sold_out').all();
  return new Set(results.map((r) => r.item_id));
}

export async function getMenu(env) {
  const off = await soldOutIds(env);
  return json({
    ok: true,
    tables: CONFIG.tables,
    categories: CATEGORIES,
    items: MENU.map((m) => ({ ...m, soldOut: off.has(m.id) })),
  });
}

// Checks the basket against the menu and works out prices on the server, so a guest can't change them
async function readOrder(env, body) {
  if (!body) return { error: fail('bad_request', 'Send the order as JSON.') };
  const table = String(body.table ?? '').trim();
  if (!tableNames().includes(table)) {
    return { error: fail('table', 'Pick your table number. It is on the QR code card on your table.') };
  }
  const off = await soldOutIds(env);
  const qty = new Map();
  for (const line of Array.isArray(body.items) ? body.items : []) {
    const item = MENU_BY_ID[line && line.id];
    const n = parseInt(line && line.qty, 10);
    if (!item || !(n >= 1)) continue;
    qty.set(item.id, Math.min(CONFIG.maxPerItem, (qty.get(item.id) || 0) + n));
  }
  if (!qty.size) return { error: fail('items', 'Add at least one dish to your order.') };
  const gone = [...qty.keys()].filter((id) => off.has(id));
  if (gone.length) {
    const names = gone.map((id) => MENU_BY_ID[id].name).join(', ');
    return { error: fail('sold_out', `Sorry, ${names} just sold out. We took it out of your order, so check it and send again.`, 409, { soldOut: gone }) };
  }
  const lines = [...qty].map(([id, n]) => ({ id, name: MENU_BY_ID[id].name, price: MENU_BY_ID[id].price, qty: n }));
  if (lines.reduce((s, l) => s + l.qty, 0) > CONFIG.maxItemsPerOrder) {
    return { error: fail('items', `That is a big order. Please ask a staff member to take orders over ${CONFIG.maxItemsPerOrder} dishes.`) };
  }
  return {
    order: {
      table,
      name: clean(body.name, 40),
      note: clean(body.note, 200),
      source: 'qr',
      lines,
      total: lines.reduce((s, l) => s + l.price * l.qty, 0),
    },
  };
}

// Returns { response, order }; order is set when one was saved, so the caller can alert staff
export async function placeOrder(env, request) {
  const body = await readBody(request);
  if (body && body.website) return { response: json({ ok: true, code: 'OD-THANKS' }) }; // honeypot: a bot
  const { order, error } = await readOrder(env, body);
  if (error) return { response: error };
  const day = nowLocal().date;
  for (let attempt = 0; attempt < 3; attempt++) {
    order.code = newCode('OD-', 4);
    try {
      // One batch runs as one transaction: the order and its dishes are saved together or not at all
      await env.DB.batch([
        env.DB.prepare('INSERT INTO orders (code, day, table_no, name, note, source, total) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .bind(order.code, day, order.table, order.name, order.note, order.source, order.total),
        ...order.lines.map((l) => env.DB.prepare(
          'INSERT INTO order_items (order_id, item_id, name, price, qty) SELECT id, ?, ?, ?, ? FROM orders WHERE code = ?'
        ).bind(l.id, l.name, l.price, l.qty, order.code)),
      ]);
      return { order, response: json({ ok: true, code: order.code, table: order.table, total: order.total, items: order.lines }, 201) };
    } catch (e) {
      if (!String(e).includes('UNIQUE')) throw e;
    }
  }
  throw new Error('could not make an order code');
}

async function itemsFor(env, ids) {
  if (!ids.length) return {};
  const { results } = await env.DB.prepare(
    `SELECT order_id, item_id, name, price, qty FROM order_items WHERE order_id IN (${ids.map(() => '?').join(',')})`
  ).bind(...ids).all();
  const by = {};
  results.forEach((r) => (by[r.order_id] ||= []).push({ id: r.item_id, name: r.name, price: r.price, qty: r.qty }));
  return by;
}

// Guests check on their own order with the code they were given
export async function orderStatus(env, url) {
  const code = String(url.searchParams.get('code') || '').toUpperCase();
  const o = await env.DB.prepare('SELECT id, code, table_no, status, total, created_at FROM orders WHERE code = ?').bind(code).first();
  if (!o) return fail('missing', 'No order with that code.', 404);
  const items = (await itemsFor(env, [o.id]))[o.id] || [];
  return json({ ok: true, code: o.code, table: o.table_no, status: o.status, total: o.total, items });
}

export async function staffOrders(env, url) {
  const day = url.searchParams.get('date') || nowLocal().date;
  if (!isDate(day)) return fail('date', 'Pick a valid date.');
  const { results } = await env.DB.prepare(
    'SELECT id, code, table_no, name, note, source, status, total, created_at, updated_at FROM orders WHERE day = ? ORDER BY id'
  ).bind(day).all();
  const items = await itemsFor(env, results.map((r) => r.id));
  const off = await soldOutIds(env);
  return json({
    ok: true,
    date: day,
    orders: results.map((r) => ({ ...r, items: items[r.id] || [] })),
    menu: MENU.map((m) => ({ id: m.id, cat: m.cat, name: m.name, price: m.price, soldOut: off.has(m.id) })),
    categories: CATEGORIES,
    tables: tableNames(),
  });
}

export async function setOrderStatus(env, request) {
  const body = await readBody(request);
  if (!body || !STATUSES.includes(body.status)) return fail('status', 'Unknown status.');
  const res = await env.DB.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").bind(body.status, +body.id).run();
  return res.meta.changes ? json({ ok: true }) : fail('missing', 'No such order.', 404);
}

export async function setSoldOut(env, request) {
  const body = await readBody(request);
  if (!body || !MENU_BY_ID[body.id]) return fail('item', 'Unknown dish.');
  await env.DB.prepare(body.soldOut ? 'INSERT OR IGNORE INTO sold_out (item_id) VALUES (?)' : 'DELETE FROM sold_out WHERE item_id = ?').bind(body.id).run();
  return json({ ok: true });
}
