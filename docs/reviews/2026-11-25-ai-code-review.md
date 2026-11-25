# AI code review, 25 Nov 2026

**Reviewer:** Claude Code (Opus 5.5), `/code-review` at effort *high*
**Scope:** `src/`, `scripts/`, `.github/` at commit `995aa26` (after removing the
unused template parts)
**Focus:** the payment path (checkout action, webhook, fulfilment rule), access
rules, shop/thank-you/event pages, the daily health check.

## Result in one line

No finding breaks the core rule: an order becomes paid **only** through a
signature-verified Stripe checkout event, a replay changes
nothing, and forged or unsigned webhooks get `400` (checked live after the
deploy). Five smaller findings, none blocking for the course.

## What was checked and holds

- The Stripe secret key is read on the server only; a non-test key is refused
  (`src/stripe/server.ts`).
- The browser sends only the product slug; name and price come from the CMS,
  as a visitor (only published products) (`src/app/(frontend)/shop/actions.ts`).
- The webhook verifies the signature on the raw body before anything else
  (`src/app/(frontend)/api/stripe/webhook/route.ts`).
- The one rule that decides "paid" is a pure function with 7 unit tests
  (`src/stripe/fulfilment.ts`, `tests/int/fulfilment.int.spec.ts`).
- Orders cannot be created through the API; status and Stripe-reported fields
  cannot be written through the admin panel or REST (`src/collections/Orders.ts`).
- Products and events: anyone reads published entries, only an admin writes.
- No user can sign up from outside: creating users needs a logged-in admin.
- After the template cleanup, `/posts`, `/search` and `/next/seed` return 404
  live; all shop pages return 200.

## Findings

| # | Severity | Where | Finding | Decision |
|---|---|---|---|---|
| 1 | existing | `api/stripe/webhook/route.ts:31` | Delayed payment methods (e.g. SEPA) would complete the session as *unpaid*; the later `checkout.session.async_payment_succeeded` is not handled, so such an order would stay pending. | **Fixed.** `canMarkPaid()` in `fulfilment.ts` is the one list of paying events; the webhook, `stripe-listen.sh`, README and go-live plan follow it. Tested. |
| 2 | existing | `shop/actions.ts:34` | The order is created before the Stripe session. If Stripe refuses, a pending order without a session id remains. | **Fixed.** If Stripe returns no checkout page, the order is deleted before the error is shown. |
| 3 | minor | `stripe/fulfilment.ts:44` | The paid amount and currency are not compared with the order's expected amount. Today the server sets both, so they cannot differ; it matters once promotion codes exist. | **Fixed.** `paidUpdate` refuses a mismatch. The currency is one constant (`CURRENCY`) used by checkout, the paid check and `check-webhook.ts`. Two new tests. |
| 4 | minor | `collections/Orders.ts:17` | An admin can still edit product, name, kind and amount of a paid order. | **Fixed.** These four fields are fixed at checkout (`update: nobody`). |
| 5 | minor | `thank-you/RefreshWhilePending.tsx:16` | After about a minute without a webhook the page stops refreshing but keeps saying "Confirming…" with no next step. | **Partly fixed.** The page now keeps checking every 15 s for 10 minutes, so a late webhook still shows up. A "this takes longer" text belongs in the CMS, which needs a new database column; that waits for the separate development database and migrations. |

Fixes landed on 25 Nov 2026 in the commit after `995aa26`, test first
(`tests/int/fulfilment.int.spec.ts`: 7 → 11 tests).

## Verification of the fixes

- Type check, lint and the unit tests (11/11) pass.
- A real purchase on a local production build (`next start`, webhooks forwarded
  by the Stripe CLI): *Roundtable seat* with `4242 4242 4242 4242` → the
  thank-you page switched to "payment confirmed", so the new amount and
  currency check accepts a correct payment.
- Stripe Checkout in this sandbox offers Klarna, Bancontact and more besides
  cards, so finding 1 was a real case, not a theoretical one.
- `scripts/check-webhook.ts` could not run: `payload run` starts Payload in
  development mode, which tries to align the shared database with the code.
  That stays blocked until development has its own database.

## Not reviewed

- The seed scripts' content (texts), only that they are idempotent.
- `tests/int/api.int.spec.ts` was not run: it connects to the database that
  development and production currently share.
