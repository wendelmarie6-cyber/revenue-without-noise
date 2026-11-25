# Revenue without Noise – website with shop

**What this is, in plain language:** the new website of Revenue without Noise,
Marie-Sophie Wendel's go-to-market practice in Munich ("Mehr Umsatz. Weniger
Lärm."). It replaces the Lovable site at revenuewithoutnoise.com. Revenue
without Noise is the brand; **Vouched** is its community: small, invitation-only
rounds in Munich where founders, partners, decision-makers and investors meet
around AI. Never a sales event.

It is the Sprint 4 project at Turing College ("Ship your own online shop"), as
the allowed alternatives **membership site** plus **bookable paid service**:

- **CMS (Payload):** every text, membership tier and service lives in the admin
  panel. The owner changes a price or a description there and it is live
  without a redeploy.
- **Payments (Stripe Checkout, test mode only):** a visitor buys a Vouched
  membership tier or books a service on Stripe's hosted page.
- **Paid means webhook:** an order or membership counts as paid only when
  Stripe's `checkout.session.completed` arrives at the server and its
  signature is verified, never because someone reached the thank-you page.

## Catalogue (collection "Products", each with name, price, description, photo)

| Product | Kind | Test price |
|---|---|---|
| Vouched Pre-Seed (up to 5 people, no revenue yet) | membership | 19 € / month |
| Vouched Seed (up to 20 people) | membership | 49 € / month |
| Vouched Series A (up to 50 people) | membership | 149 € / month |
| Roundtable seat (one seat at one industry table) | one-off | 39 € |
| Partner Fit Session (60 min: which partner types fit, and who first) | service | 190 € |
| Partner GTM Sprint (two weeks: partner ICP, shortlist, first intros) | service | 1,900 € |
| Partner GTM Bootcamp (one day, 20 founders; price confirmed 18 Nov 2026) | one-off | 590 € |

Also in the CMS (decided 18 Nov 2026):

- **Partner GTM Bootcamp** (one day, 20 founders: partner ICP, top-10 partner
  shortlist, 90-day plan, peer check) as a seventh product, one-off.
- **Events** collection for Vouched: a recurring **Stammtisch** for the whole
  community and niche **Tables** for one group of decision-makers (decided
  25 Nov 2026: no Finance/Mittelstand table, no Mittelstand anywhere).
  Decision-makers, partners and investors never pay; they apply.
- **Application form** (Payload form builder) for Vouched Basecamp and the
  Tables. Founders pay for preparation and intros, never for a seat in front
  of decision-makers.

For the course only the first confirmation of a subscription is processed
(paid → member). Renewals, cancellations and failed charges are separate
webhook cases and come after the course; the README says so.

Business background: `~/Documents/GitHub/vouched-network/VOUCHED.md`.
Course plan: `~/Documents/GitHub/sprint4/PROJEKTPLAN.md` (Teil 7).

## Rules

- **Test mode only.** Stripe keys start with `sk_test_` / `pk_test_`. Never a
  live key, never a real card. Every page with a buy button shows
  "Test mode – no real payments".
- **Not on the real domain** while Stripe is in test mode. The shop is
  reviewed at its Vercel address; the Lovable site stays as it is.
- **Secrets only in environment variables** (`.env` locally, Vercel settings
  when deployed): `DATABASE_URL`, `PAYLOAD_SECRET`, `STRIPE_SECRET_KEY`,
  `STRIPE_WEBHOOK_SECRET`, and the rest. Never in code, comments, commit
  messages or the repository. `.env` is git-ignored. The Stripe secret key and
  the webhook secret are read on the server only; nothing secret gets a
  `NEXT_PUBLIC_` prefix.
- **Access rule for products:** anyone can view, only a logged-in admin can
  create, edit or delete.
- **No real people's details** in code, seed data or examples. Client
  references only with the client's written approval.
- **Packages:** ask before adding one. Payload and Stripe work from their
  agent skills (`.claude/skills/payload`, the `stripe` plugin), not from
  memory.
- **Language:** the site is in **English first** (decided 11 Nov 2026: the
  reviewer reads English, and the go-to-market audience is international).
  German follows later as a second locale through Payload's localization;
  do not hard-code copy in either language, it lives in the CMS.
- **Git:** commit only when asked; descriptive messages, never "updates";
  stage files by name, never `git add -A`; show the diff first. Code and
  commit messages in English; conversation in German.
