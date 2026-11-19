# Revenue without Noise: website with shop

> **Test mode: no real payments.** Stripe runs in test mode only. Use Stripe's
> test cards (e.g. `4242 4242 4242 4242`, any future date, any CVC). Never a
> real card.

The new website of **Revenue without Noise**, a go-to-market practice in Munich
("Mehr Umsatz. Weniger Lärm."). **Vouched** is its community: small,
invitation-only tables in Munich where founders, the partners who implement,
and the decision-makers who buy sit together around AI. Never a sales event.

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

1. Node 20+ and npm. Install: `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` (Postgres; Supabase session pooler works)
   - `PAYLOAD_SECRET`, `CRON_SECRET`, `PREVIEW_SECRET` (any long random strings)
   - `NEXT_PUBLIC_SERVER_URL=http://localhost:3001`
   - `STRIPE_SECRET_KEY` (`sk_test_…` only) and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_test_…`)
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
4. Seed the catalogue, then the events, the application form and the header
   links (both scripts are idempotent and never overwrite admin edits):
   ```bash
   DATABASE_POOL_MAX=3 npx payload run scripts/seed-products.ts
   DATABASE_POOL_MAX=3 npx payload run scripts/seed-events.ts
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
notifications for applications, and the final design.

## Deployment

The shop is reviewed at its Vercel address, **not** on revenuewithoutnoise.com,
for as long as Stripe is in test mode. Set the same environment variables in
Vercel and register `https://<vercel-url>/api/stripe/webhook` as a webhook
endpoint for `checkout.session.completed` in the Stripe test dashboard.
