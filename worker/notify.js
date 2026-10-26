import { EmailMessage } from 'cloudflare:email';
import { slotLabel } from './config.js';

// Tells staff about a booking. Each channel is optional: it runs only when its settings exist.
export async function notifyStaff(env, b, kind = 'New booking') {
  const day = new Date(b.date + 'T00:00:00Z').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
  const lines = [
    `${kind} ${b.code}`,
    `${b.name}, ${b.guests} ${b.guests === 1 ? 'guest' : 'guests'}`,
    `${day} at ${slotLabel(b.slot)}`,
    `Phone: +${b.phone}`,
  ];
  if (b.note) lines.push(`Note: ${b.note}`);
  const text = lines.join('\n');
  const jobs = [];

  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    jobs.push(fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }),
    }));
  }

  if (env.MAIL && env.ALERT_FROM && env.ALERT_TO) {
    const raw = [
      `From: Toku's Bookings <${env.ALERT_FROM}>`,
      `To: ${env.ALERT_TO}`,
      `Subject: ${lines[0]}: ${lines[2]}, ${b.guests} pax`,
      `Message-ID: <${b.code}.${Date.now()}@${env.ALERT_FROM.split('@')[1]}>`,
      `Date: ${new Date().toUTCString()}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      '',
      text,
    ].join('\r\n');
    jobs.push(env.MAIL.send(new EmailMessage(env.ALERT_FROM, env.ALERT_TO, raw)));
  }

  const results = await Promise.allSettled(jobs);
  results.filter((r) => r.status === 'rejected').forEach((r) => console.error('notify failed', r.reason));
}
