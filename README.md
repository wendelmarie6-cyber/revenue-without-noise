# Revenue without Noise: website with shop

> **Test mode: no real payments.** Stripe runs in test mode only. Use Stripe's
> test cards (e.g. `4242 4242 4242 4242`, any future date, any CVC). Never a
> real card.

**Live:** https://revenue-without-noise.vercel.app (deployed from `main` on
Vercel; the real domain stays on the old site until Stripe goes live).

The new website of **Revenue without Noise**, a go-to-market practice in Munich
("Mehr Umsatz. Weniger Lärm."). **Vouched** is its community: small,
invitation-only tables in Munich where founders, the partners who implement,
the decision-makers who buy and investors sit together around AI. Never a
sales event. The practice works with B2B AI founders before product-market fit.

Built for Turing College Sprint 4 ("Ship your own online shop") as a
**membership site plus bookable paid services**:

- **CMS:** every text, membership tier, service and event lives in the Payload
  admin panel. Change a price or a description there and it is live without a
  redeploy.
- **Payments:** visitors buy a Vouched membership (monthly subscription) or
  book a seat or service (one-off) on Stripe's hosted Checkout page.
- **Applications:** decision-makers and partners never pay; they apply through
  a form. Founders pay for preparation and introductions, never for a seat in
  front of decision-makers.

## Stack

- [Payload CMS 3](https://payloadcms.com), running inside the Next.js 16 app
  (one project, one database)
- Postgres (Supabase) via `@payloadcms/db-postgres`
- Stripe Checkout (test mode) and a signature-verified webhook
- Payload form builder for applications
- Tailwind CSS; Vitest for the payment rule

## Pages

| Path | What it shows |
|---|---|
| `/` | Home page, built from blocks in the `pages` collection |
| `/shop` | All published products with price and buy button |
| `/shop/thank-you` | Order status as confirmed by the webhook (pending → paid) |
| `/events` | Upcoming published events, sorted by date |
| `/events/[slug]` | One event; a buy button only if a paid product is linked; the application form |
| `/apply` | The "Apply to Vouched" form |
| `/admin` | Payload admin panel |

## Content model

| Collection / global | Purpose |
|---|---|
| `products` | Seven products: three Vouched memberships, a roundtable seat, two services, the Partner GTM Bootcamp |
| `orders` | One per checkout; `status` is written by the server only |
| `events` | Vouched Tables, Bootcamps, Stammtische (format, date, location, seats, audience, host, optional product) |
| `forms`, `form-submissions` | Form builder: the application form and what people send |
| `shop` global | All copy on the shop pages, incl. the test-mode notice |
| `events-page` global | All copy on the events and apply pages, and which form they show |
| `site` global | Site name and description (header, footer, page titles, link previews) |
| `pages` | The home page (and any further page), built from CMS blocks |
| `header` global | Navigation links (Shop, Events, Apply) |

## Access rules

- **Products, events:** anyone can read *published* entries; only a logged-in
  admin can create, edit or delete. Drafts are hidden from visitors.
- **Orders:** nobody can create one through the API; only the checkout action
  on the server does. Only admins can read them. The `status`, the amount
  Stripe reported and the other Stripe fields cannot be written through the
  admin panel or the REST API at all, only by the server code.
- **Form submissions:** anyone can submit; only an admin can read them; nobody
  can edit them.
- **Prices** are read from the CMS on the server when checkout starts. The
  browser only sends the product slug, so a visitor cannot change what they pay.

## The rule: paid only through a verified webhook

An order or membership counts as paid **only** when Stripe's
`checkout.session.completed` event reaches
`/api/stripe/webhook` and its signature verifies against
`STRIPE_WEBHOOK_SECRET`. Reaching the thank-you page proves nothing: anyone
can open that URL. The thank-you page only *reads* the order status and
refreshes while it is still pending.

- Checkout action: `src/app/(frontend)/shop/actions.ts`
- Webhook route: `src/app/(frontend)/api/stripe/webhook/route.ts`
- The pure rule (which events mark which order paid, replays are harmless):
  `src/stripe/fulfilment.ts`, tested in `tests/int/fulfilment.int.spec.ts`

## Local setup

1. Node 22.23.4+ (or 24.22.1+, see `engines` in `package.json`) and npm. Install: `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` (Postgres; Supabase session pooler works)
   - `PAYLOAD_SECRET`, `CRON_SECRET`, `PREVIEW_SECRET` (any long random strings)
   - `NEXT_PUBLIC_SERVER_URL=http://localhost:3001`
   - `STRIPE_SECRET_KEY` (`sk_test_…` only). The publishable key is not needed:
     the site uses Stripe's hosted Checkout page, so no Stripe code runs in the browser.
   - `STRIPE_WEBHOOK_SECRET` (`whsec_…`, printed by `stripe listen`, see below)
   - Optional `DATABASE_POOL_MAX` (default 5). Supabase's session pooler allows
     15 clients in total, so keep it small (e.g. 3) for scripts.

   Secrets live only in `.env` (git-ignored) or in the hosting provider's
   settings, never in code. Nothing secret gets a `NEXT_PUBLIC_` prefix.
3. Start the dev server on port 3001:
   ```bash
   npm run dev -- -p 3001
   ```
   Open http://localhost:3001/admin and create the first admin user.
4. Seed the content (all three scripts are idempotent and never overwrite
   admin edits): the catalogue; the events, the application form and the
   header links; the site settings and the home page.
   ```bash
   DATABASE_POOL_MAX=3 npx payload run scripts/seed-products.ts
   DATABASE_POOL_MAX=3 npx payload run scripts/seed-events.ts
   DATABASE_POOL_MAX=3 npx payload run scripts/seed-site.ts
   ```

## Testing payments locally

Forward Stripe's test webhooks to the dev server (reads the test key from
`.env`, refuses anything that is not a test key):

```bash
sh scripts/stripe-listen.sh        # default port 3001
```

Copy the `whsec_…` it prints into `STRIPE_WEBHOOK_SECRET` and restart the dev
server. Then buy something on `/shop` with a test card and watch the order
switch from pending to paid on the thank-you page and in the admin panel.

End-to-end check of the webhook rule (dev server must be running):

```bash
DATABASE_POOL_MAX=3 npx payload run scripts/check-webhook.ts
```

It creates a pending order, then posts (1) an unsigned "paid" event and (2) one
with a bad signature: both must get `400` and the order stays pending. (3) A
correctly signed event marks it paid; (4) a replay changes nothing. The test
order is deleted afterwards.

Unit tests for the payment rule:

```bash
npx vitest run --config ./vitest.config.mts tests/int/fulfilment.int.spec.ts
```

## Out of scope for the course

Only the **first** confirmation of a subscription is processed (paid →
member). These webhook cases come after the course:

- renewals (`invoice.paid`)
- cancellations (`customer.subscription.deleted`)
- failed charges (`invoice.payment_failed`)
- refunds

Also not yet: a German locale (planned via Payload localization), email
notifications for applications, the final design and logo, image uploads on
Vercel (the `media` collection needs a storage adapter such as Vercel Blob
first), and database migrations (see Deployment).

## Deployment

Live at **https://revenue-without-noise.vercel.app**, built by Vercel from
`main`. It stays off revenuewithoutnoise.com for as long as Stripe is in test
mode; moving the domain is a settings change (Vercel domain, DNS at the
registrar, `NEXT_PUBLIC_SERVER_URL`, the Stripe webhook URL), not a code change.

Environment variables in Vercel (Production): `DATABASE_URL`,
`DATABASE_POOL_MAX=2`, `PAYLOAD_SECRET`, `CRON_SECRET`, `PREVIEW_SECRET`,
`NEXT_PUBLIC_SERVER_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

- **Database on Vercel: use Supabase's *transaction* pooler (port 6543).**
  Every serverless instance keeps its own connections; the session pooler
  (port 5432) allows 15 in total and runs out under light load. Locally the
  session pooler is fine.
- **Webhook:** in the Stripe test dashboard (Workbench → Webhooks) an
  endpoint `https://revenue-without-noise.vercel.app/api/stripe/webhook` for
  `checkout.session.completed`, snapshot payload. Its signing secret is
  `STRIPE_WEBHOOK_SECRET` in Vercel (different from the local `stripe listen`
  one).
- **Schema:** there are no migrations yet. Payload creates new tables when the
  dev server (or a `payload run` script) starts against the database, so a
  schema change is pushed locally before the deploy that needs it. Separate
  development and production databases with migrations come after the course.

## Review walkthrough

1. **CMS change is live at once:** in `/admin` change a product's price or
   description, publish, reload `/shop`: the new value shows, no redeploy.
2. **Paid only by webhook:** buy *Roundtable seat* with `4242 4242 4242 4242`.
   The thank-you page says "Confirming…" until Stripe's webhook arrives, then
   "confirmed"; in `/admin` → Orders the order is *Paid*.
3. **A declined card marks nothing:** try `4000 0000 0000 0002`. Stripe
   declines it, no webhook fires, the order stays *Pending*.
4. **Forged webhooks are rejected:** a POST to `/api/stripe/webhook` without
   or with a wrong `stripe-signature` header gets `400`.

Review reports live in [`docs/reviews/`](docs/reviews/).

Optional tasks done: a second collection (**Events**), an **Orders**
collection written only by the server and the webhook, and a **confirmation
page** (`/shop/thank-you`) that shows the confirmed state.
