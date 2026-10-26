// Booking rules. Change these and redeploy; nothing else needs touching.
export const CONFIG = {
  firstSlot: '12:00',      // first table time (24h, Gwalior time)
  lastSlot: '22:00',       // last table time
  slotMinutes: 60,         // one booking holds its seats for this long
  seatsPerSlot: 20,        // seats that can be booked online in each slot
  maxGroup: 8,             // bigger groups are sent to WhatsApp / phone
  daysAhead: 30,           // how far ahead guests can book
  leadMinutes: 60,         // earliest booking is this long from now
  closedWeekdays: [],      // 0 = Sunday ... 6 = Saturday
  maxActivePerPhone: 3,    // upcoming bookings one phone number can hold
};

export const TZ_OFFSET_MIN = 330; // India Standard Time, UTC+5:30, no DST

export function slotTimes() {
  const toMin = (t) => +t.slice(0, 2) * 60 + +t.slice(3);
  const out = [];
  for (let m = toMin(CONFIG.firstSlot); m <= toMin(CONFIG.lastSlot); m += CONFIG.slotMinutes) {
    out.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  }
  return out;
}

export function slotLabel(t) {
  const h = +t.slice(0, 2), m = t.slice(3);
  return `${h % 12 || 12}:${m} ${h < 12 ? 'am' : 'pm'}`;
}

// Current date (YYYY-MM-DD) and minutes since midnight in Gwalior
export function nowLocal() {
  const d = new Date(Date.now() + TZ_OFFSET_MIN * 60000);
  return { date: d.toISOString().slice(0, 10), minutes: d.getUTCHours() * 60 + d.getUTCMinutes() };
}

export function addDays(date, n) {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
