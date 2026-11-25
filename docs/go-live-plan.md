# Go-live plan: from the Stripe sandbox to real payments

Written, **not executed** (optional task "A written go-live plan"). The shop
stays in Stripe's sandbox for the course. This is exactly what would change to
take real money, following Stripe's go-live checklist.

## 1. Activate the Stripe account
- Stripe Dashboard → Activate account: legal business name and address, tax
  details, a representative, and a bank account for payouts.
- Stripe reviews this before live payments work; allow a few days.
- Set the statement descriptor (what appears on the customer's card statement),
  e.g. `REVENUE W/O NOISE`.

## 2. Recreate products and prices in live mode
Not needed for this app: Checkout Sessions are created with inline `price_data`
from the CMS (`src/app/(frontend)/shop/actions.ts`), so there are no Stripe
product or price objects to copy. The CMS stays the single source of prices.

## 3. Register a live webhook endpoint
- Dashboard (live mode) → Developers → Webhooks → Add destination.
- URL: `https://<production-domain>/api/stripe/webhook`, events
  `checkout.session.completed` and `checkout.session.async_payment_succeeded`,
  snapshot payload.
- Copy its **new** signing secret. The live endpoint has a different secret from
  the test endpoint; forgetting to swap it is the most common go-live failure
  (payments succeed but no order is ever marked paid).

## 4. Swap the keys in Vercel (a settings change, no code change)
| Variable | Sandbox | Live |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_…` | `sk_live_…` (or a restricted `rk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | test endpoint `whsec_…` | live endpoint `whsec_…` |
| `NEXT_PUBLIC_SERVER_URL` | Vercel URL | the production domain |

Then redeploy. Keep the test keys in the Preview environment so preview
deployments keep using the sandbox.

## 5. Code and content changes that go with it
- `CLAUDE.md` rule "test mode only" is replaced by "live in Production, sandbox
  in Preview and locally".
- Shop global: remove the "Test mode – no real payments" notice (it lives in
  the CMS, so this is an admin edit).
- `scripts/stripe-listen.sh` keeps refusing live keys: local work stays in the
  sandbox.
- Handle the subscription webhook cases that are out of scope for the course:
  `invoice.paid`, `customer.subscription.deleted`, `invoice.payment_failed`.
- Legal pages: imprint, privacy policy (Stripe, Vercel, Supabase as processors),
  terms and the consumer right of withdrawal for one-off bookings.

## 6. Verify
1. Buy the cheapest product on the live site with a real card.
2. Check the order turns **Paid** in `/admin` → Orders, and the webhook shows
   `200` under the live endpoint's recent deliveries.
3. Refund the payment in the Stripe Dashboard.
4. Run the health check workflow once by hand (Actions → Live shop health check → Run).
