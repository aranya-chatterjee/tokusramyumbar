# Bookings and table orders: how it runs

The site now runs as one Cloudflare Worker. It serves the static pages as before, and answers the booking API at `/api/*`. Bookings are stored in a Cloudflare D1 database. Everything fits in Cloudflare's free plan.

- Guests pick a date, see the times that still have seats, and get a booking code straight away.
- A slot can't be overbooked. The seat check and the insert happen in one database statement.
- Staff get a Telegram message and/or an email for every new booking.
- Staff open `/staff/` with a PIN to see the day's bookings, mark arrived / no-show / cancelled, and add phone or walk-in bookings.
- If the API can't be reached, or the group is 9 or more, the form falls back to the prefilled WhatsApp message.

Rules (hours, seats per slot, biggest group, how far ahead, number of tables) live in `worker/config.js`.

## Table orders

- Each table has a QR card linking to `/order/?table=N`. Print the cards from `/staff/qr.html` (also linked from the staff Menu tab).
- Guests pick dishes, add a note, and send the order. They see it go from Received to Being made to Served on their phone, and pay at the counter.
- Staff see orders on the Orders tab of `/staff/`: New, Preparing, Served. Tap a table chip to see that table's bill and mark it paid.
- The Menu tab marks dishes sold out for the day.
- Dishes, categories and prices live in `worker/menu.js`. Prices are worked out on the server, so a guest can't change them.
- New orders go to the staff Telegram group once Telegram is set up.

After pulling these changes into a site that is already live, run the database setup once more (it only adds the new tables) and deploy:

```
npx wrangler d1 execute tokus-bookings --remote --file=worker/schema.sql
npx wrangler deploy
```

## One-time setup

Run these from the repo folder. Needs Node 18+.

```
npx wrangler login
npx wrangler d1 create tokus-bookings          # copy the database_id it prints into wrangler.toml
npx wrangler d1 execute tokus-bookings --remote --file=worker/schema.sql
npx wrangler secret put STAFF_PIN              # a long passphrase, not 1234
npx wrangler secret put TABLE_SECRET           # long random text; then print the cards from /staff/qr.html
```

Telegram alerts (optional):

1. In Telegram, message @BotFather, send `/newbot`, and copy the token.
2. Make a staff group, add the bot, send any message in the group.
3. Open `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy the group's `chat.id` (a negative number).
4. `npx wrangler secret put TELEGRAM_BOT_TOKEN` and `npx wrangler secret put TELEGRAM_CHAT_ID`.

Email alerts (optional): turn on Email Routing for tokusramyumbar.com in the Cloudflare dashboard, add the staff inbox as a verified destination address, and put that address in `ALERT_TO` in `wrangler.toml`.

Then deploy:

```
npx wrangler deploy
```

In the Cloudflare dashboard, open the `tokusramyumbar` Worker, go to Settings, then Domains & Routes, and add `tokusramyumbar.com` as a custom domain.

## Try it locally

```
npx wrangler d1 execute tokus-bookings --local --file=worker/schema.sql
echo "STAFF_PIN=test" > .dev.vars
npx wrangler dev
```

Open http://localhost:8787 for the site and http://localhost:8787/staff/ for the staff page.
