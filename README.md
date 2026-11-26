# Revenue without Noise: website with shop

> **Test mode: no real payments.** Stripe runs in its sandbox with test keys
> only. Use Stripe's test cards (`4242 4242 4242 4242` succeeds,
> `4000 0000 0000 0002` is declined; any future date, any CVC). Never a real card.

**Live:** https://revenue-without-noise.vercel.app · **Admin:** `/admin`

## What the shop sells

**Revenue without Noise** is a go-to-market practice in Munich ("More revenue.
Less noise.") for B2B SaaS founders, mostly before product-market fit.
**Vouched** is its community: small, recurring evenings in Munich where
founders, decision-makers, partners and investors sit at one table. Never a
sales event.

Built for Turing College Sprint 4 ("Ship your own online shop") as two of the
allowed alternatives combined, a **membership site** plus a **bookable paid
service** (see `CLAUDE.md`):

| Product | Kind | Test price |
|---|---|---|
| Vouched Pre-Seed / Seed / Series A | monthly membership (Stripe subscription) | 19 € / 49 € / 149 € per month |
| Roundtable seat | one-off | 39 € |
| Partner Fit Session | bookable service | 190 € |
| Partner GTM Sprint | bookable service | 1,900 € |
| Partner GTM Bootcamp | one-off day | 590 € |

Decision-makers, partners and investors never pay: they apply through the
"Apply to Vouched" form.

## How the owner edits content

Everything a visitor reads comes from the Payload admin panel at `/admin`
(login required). Pages are rendered on every request, so a saved change is
live at once, **without a redeploy**.

| To change … | In the admin panel |
|---|---|
| a product's name, price, description or photo | **Products** → pick the product → edit → **Publish** |
| hide a product | **Products** → **Unpublish** (drafts are invisible to visitors) |
| an event (date, place, seats, audience, linked product) | **Events** |
| the application form's fields | **Forms** → *Apply to Vouched* |
| who applied | **Form Submissions** (admins only) |
| paid and pending orders | **Orders** (read-only status, written by the server) |
| texts on the shop, events, apply, thank-you and cancel pages (incl. the small "§ 01 · …" kicker lines) | **Globals** → *Shop*, *Events & Apply* |
| site name and link-preview text | **Globals** → *Site settings* |
| the home page | **Pages** → *Home* |
| the navigation and the "Book a call" button | **Globals** → *Header* |
| footer links (to revenuewithoutnoise.com) and the footer line | **Globals** → *Footer* |
| uploaded images | **Media** (product photos are picked from here) |

**Green italic words** as on the main website: in a plain heading field wrap
the words in `*asterisks*` (`Join Vouched, or *book a session*`); in rich text
make them italic. A rich-text **Heading 6** is shown as a kicker line.

Access rule: anyone can view published products and events; only a logged-in
admin can create, edit or delete them.

## Design

The shop looks and speaks like the main website,
[revenuewithoutnoise.com](https://revenuewithoutnoise.com): the same warm
near-black and off-white, one green accent, Fraunces headings with green
italic emphasis, Inter for text, "§ 01 · …" kicker lines, thin rules instead
of shadows, and the RWN mark. Colours are tokens in
`src/app/(frontend)/globals.css`, fonts load through `next/font` (no extra
package). The header's "Book a call", the box below the products and the
footer link back to the main website.

## Stack

- [Payload CMS 3](https://payloadcms.com) inside a Next.js 16 app (one project)
- Postgres on Supabase via `@payloadcms/db-postgres`
- Stripe hosted Checkout (sandbox) and a signature-verified webhook
- Vercel hosting; media on Vercel Blob (`@payloadcms/storage-vercel-blob`)
- Payload form builder for applications; Tailwind CSS; Vitest; ESLint

Started from Payload's website template. The parts this shop does not use were
removed: the blog (Posts, Categories), search, redirects, the demo seed
endpoint, the Docker files and the template's end-to-end tests.

Agent skills were installed before building: the Payload skills
(`npx skills add payloadcms/skills`, see `.claude/skills/` and
`skills-lock.json`) and the Stripe plugin
(`claude plugin install stripe@claude-plugins-official`, enabled in
`.claude/settings.json`).

## Pages

| Path | What it shows |
|---|---|
| `/` | Home page, built from blocks in the `pages` collection |
| `/shop` | All published products with photo, price and buy button |
| `/shop/thank-you` | The bought product and its status as confirmed by the webhook (pending → paid) |
| `/shop/cancelled` | Shown when the customer leaves Stripe Checkout without paying |
| `/events`, `/events/[slug]` | Upcoming events; a buy button only if a paid product is linked; the application form |
| `/apply` | The "Apply to Vouched" form |
| `/admin` | Payload admin panel |

## The rule: paid only through a verified webhook

An order counts as paid **only** when Stripe's `checkout.session.completed`
event (or, for a delayed payment method, `checkout.session.async_payment_succeeded`)
reaches `/api/stripe/webhook` and its signature verifies against
`STRIPE_WEBHOOK_SECRET`. Reaching the thank-you page proves nothing: anyone can
open that URL. The thank-you page only *reads* the order status and refreshes
while it is still pending.

1. **Checkout** (`src/app/(frontend)/shop/actions.ts`): the browser sends only
   the product slug; the server reads name and price from the CMS, creates an
   order with status `pending` and a Stripe Checkout Session, and redirects to
   Stripe's hosted page.
2. **Webhook** (`src/app/(frontend)/api/stripe/webhook/route.ts`): verifies the
   signature on the raw body; anything unsigned or forged gets `400`.
3. **The rule** (`src/stripe/fulfilment.ts`, tested in
   `tests/unit/fulfilment.test.ts`): only a completed, paid session marks
   its order `paid`, and only if amount and currency match what the checkout
   asked for; a replay of the same event changes nothing.
4. **A declined card** never completes the session, so no webhook arrives and
   the order stays `pending`. Leaving Checkout leads to `/shop/cancelled`.

## Access rules

- **Products, events:** anyone reads *published* entries; only a logged-in
  admin creates, edits or deletes.
- **Orders:** nobody can create one through the API; only the checkout action
  on the server does. Only admins can read them. The status and the
  Stripe-reported fields cannot be written through the admin panel or the REST
  API at all, only by server code.
- **Form submissions:** anyone can submit; only an admin can read; nobody edits.

## Key decisions and the alternatives

| Decision | Chosen | Alternatives and why they lost |
|---|---|---|
| Payment page | **Stripe hosted Checkout** | *Payment Element* in our own page: more control, but card data and 3-D Secure handling move into our code. *Payment Links*: prices live in Stripe, so the CMS would no longer be the one place to change a price. |
| Where prices live | **In the CMS**, sent to Stripe per checkout (`price_data`) | Stripe Products and Prices synced from the CMS: a second copy of every price and a sync job that can drift. Cost of the choice: Stripe's dashboard shows no product catalogue. |
| What counts as paid | **The signed webhook** (`checkout.session.completed`, `checkout.session.async_payment_succeeded`) | The thank-you page: anyone can open it, and a customer can close the tab first. Asking Stripe's API from the thank-you page: still depends on the customer staying. |
| Membership billing | **Stripe subscription**, only the first confirmation handled | One-off yearly payment: simpler, but not what a monthly membership is. Renewals and cancellations are separate webhook events, see *Out of scope*. |
| CMS | **Payload inside the Next.js app** | A hosted CMS (Contentful, Sanity): a second service and account, content fetched over HTTP, access rules outside the code. Payload is one repo, one deploy, and its Local API runs on the server without a network hop. |
| Database | **Postgres on Supabase** | SQLite: Vercel's serverless functions have no lasting disk. MongoDB: possible with Payload, but Postgres and Supabase were already known from Sprints 2 and 3. On Vercel the *transaction* pooler (port 6543), because the session pooler allows only 15 clients and every serverless instance opens its own. |
| Product photos | **Vercel Blob** | The local disk: on Vercel it is read-only and gone after each deploy. Supabase Storage or S3: works through Payload's S3 adapter, but needs a bucket, keys and a policy; Blob is one token and an official Payload adapter. |
| Freshness | **Every page reads the CMS on each request** (`force-dynamic`) | Static pages with revalidation: faster, but a change would need a revalidation hook per page before it shows. At this traffic one database read per page view costs nothing noticeable. |

## Run it locally

1. Node 22.23.4+ (or 24.22.1+, see `engines` in `package.json`) and npm, then
   `npm install`.
2. Copy `.env.example` to `.env` and fill in the values. Where each comes from:

   | Variable | Where the value comes from |
   |---|---|
   | `DATABASE_URL` | Supabase → your project → **Connect** → Session pooler (port 5432) URI, with your database password |
   | `DATABASE_POOL_MAX` | `2` (Supabase's session pooler allows 15 clients in total) |
   | `PAYLOAD_SECRET`, `CRON_SECRET`, `PREVIEW_SECRET` | any long random strings, e.g. `openssl rand -hex 32` |
   | `NEXT_PUBLIC_SERVER_URL` | `http://localhost:3001` |
   | `STRIPE_SECRET_KEY` | Stripe Dashboard (sandbox) → Developers → API keys → secret key `sk_test_…` |
   | `STRIPE_WEBHOOK_SECRET` | printed by `sh scripts/stripe-listen.sh` (`whsec_…`) |
   | `BLOB_READ_WRITE_TOKEN` | leave empty locally (uploads go to the local disk) |

   Secrets live only in `.env` (git-ignored) and in Vercel's settings, never in
   the repository. Nothing secret has a `NEXT_PUBLIC_` prefix. The publishable
   key is not needed: Checkout is hosted by Stripe.
3. Start the app and create the first admin user at http://localhost:3001/admin.
   **Use a database of your own for development.** In development Payload
   aligns the database schema with the code on start (`npm run dev` and every
   `npx payload run` script); pointed at the production database, that would
   change the live site's tables.
   ```bash
   npm run dev -- -p 3001
   ```
4. Seed the content (idempotent, never overwrites admin edits):
   ```bash
   DATABASE_POOL_MAX=2 npx payload run scripts/seed-products.ts
   DATABASE_POOL_MAX=2 npx payload run scripts/seed-events.ts
   DATABASE_POOL_MAX=2 npx payload run scripts/seed-site.ts
   DATABASE_POOL_MAX=2 npx payload run scripts/seed-design.ts
   ```
   Product photos (`scripts/product-photos/`) are uploaded with
   `DATABASE_POOL_MAX=2 npx payload run scripts/upload-product-photos.ts`; it
   needs `BLOB_READ_WRITE_TOKEN`, because the photos must reach the live site.
5. In a second terminal, forward Stripe's sandbox webhooks to the app, copy
   the printed `whsec_…` into `.env` and restart the dev server:
   ```bash
   sh scripts/stripe-listen.sh
   ```

### Checks

```bash
npm run typecheck                                             # types
npm run lint                                                  # lint
npm test                                                      # unit tests of the paid rule (Vitest)
DATABASE_POOL_MAX=2 npx payload run scripts/check-webhook.ts  # webhook end to end (dev server running)
```

`check-webhook.ts` creates a pending order and posts (1) an unsigned "paid"
event and (2) one with a bad signature: both get `400` and the order stays
pending. (3) A correctly signed event marks it paid; (4) a replay changes
nothing. The test order is deleted afterwards.

## Deployment (Vercel)

Deployed from this repository's `main` branch at
https://revenue-without-noise.vercel.app. Environment variables in Vercel:
`DATABASE_URL`, `DATABASE_POOL_MAX=2`, `PAYLOAD_SECRET`, `CRON_SECRET`,
`PREVIEW_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, `BLOB_READ_WRITE_TOKEN`.

- **Database on Vercel: Supabase's *transaction* pooler (port 6543).** Every
  serverless instance keeps its own connections; the session pooler allows 15
  in total and runs out under light load.
- **Webhook:** Stripe sandbox → Workbench → Webhooks → destination
  `https://revenue-without-noise.vercel.app/api/stripe/webhook`, events
  `checkout.session.completed` and `checkout.session.async_payment_succeeded`
  (a delayed payment method that succeeds later), snapshot payload. Its signing secret is
  `STRIPE_WEBHOOK_SECRET` in Vercel (different from the local one).
- **Media:** a Vercel Blob store connected to the project provides
  `BLOB_READ_WRITE_TOKEN`; uploaded product photos are stored there.
- The site stays off revenuewithoutnoise.com while Stripe is in the sandbox.

## Optional tasks delivered

| Task | Where to see it |
|---|---|
| **Order confirmation page** (easy) | `/shop/thank-you` lists the bought product and shows "payment confirmed" once the webhook has marked the order paid |
| **A second Payload collection** (easy) | **Events** (plus Pages, Forms and the copy globals), editable in `/admin`, live without a redeploy |
| **An Orders collection** (medium) | `/admin` → Orders; the status is set to paid only by the verified webhook |
| **A scheduled health check** (hard) | `.github/workflows/health-check.yml`: daily, checks pages, that products load and that an unsigned webhook is rejected |
| **A written go-live plan** (hard) | [`docs/go-live-plan.md`](docs/go-live-plan.md) |

Not done for the course: separate development and production databases,
custom domain, instant-rollback rehearsal, migration flow, deployment pipeline.

## Review walkthrough

1. **CMS change is live at once:** in `/admin` change a product's price or
   description, publish, reload `/shop`: the new value shows, no redeploy.
2. **Paid only by webhook:** buy *Roundtable seat* with `4242 4242 4242 4242`.
   The thank-you page says "Confirming…" until Stripe's webhook arrives, then
   "confirmed"; in `/admin` → Orders the order is *Paid*.
3. **A declined card marks nothing:** try `4000 0000 0000 0002`. Stripe
   declines it on its page, no webhook fires, the order stays *Pending*.
4. **Forged webhooks are rejected:** a POST to `/api/stripe/webhook` without
   or with a wrong `stripe-signature` header gets `400`.

Screenshots and the webhook log of a declined and a successful test purchase:
[`docs/evidence/`](docs/evidence/README.md).

## Out of scope for the course

Only the **first** confirmation of a subscription is processed (paid →
member). Renewals (`invoice.paid`), cancellations
(`customer.subscription.deleted`), failed charges (`invoice.payment_failed`)
and refunds come after the course. Also later: a German locale (Payload
localization), email notifications for applications.

## Reviews and tests

- AI code review of 25 Nov 2026 with every finding and what was done about it:
  [`docs/reviews/2026-11-25-ai-code-review.md`](docs/reviews/2026-11-25-ai-code-review.md).
  All review reports live in [`docs/reviews/`](docs/reviews/).
- Tests, from fast to slow: unit tests of the paid rule
  (`tests/unit/fulfilment.test.ts`, `npm test`); the webhook end to end
  against a running app (`scripts/check-webhook.ts`); the daily live check in
  GitHub Actions. Integration tests against a separate test database come
  with the separate development database (see *Not done for the course*).
