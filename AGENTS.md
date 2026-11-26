<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## What this app is

The website of Revenue without Noise (a go-to-market practice in Munich) with
a shop: memberships of its community **Vouched** and bookable services, sold
through Stripe Checkout in **test mode only**. Payload CMS runs inside this
Next.js 16 app; every text, product and price is edited in `/admin`. Postgres
on Supabase, hosted on Vercel, media on Vercel Blob. The full description,
catalogue and decisions are in `CLAUDE.md` and `README.md`.

The rule the whole shop is built around: an order is paid **only** when
Stripe's signed webhook says so (`src/stripe/fulfilment.ts`), never because
someone reached the thank-you page.

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
- **Tests run from the command line:** `npm test` (unit tests of the paid
  rule), `npm run typecheck`, `npm run lint`, before every commit. A rule that
  decides money or access gets a failing test first, then the fix.
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
- **Development has its own database.** `npm run dev` and every
  `npx payload run` script align the database schema with the code. Never
  point them at the production database.

## Checks: run them, then report them

Run before every commit and report the exact commands and their results
(pass/fail counts), so the human can verify the work:

```bash
npm run typecheck
npm run lint
npm test
```

A change the browser can show is also checked in the browser, on the real
path, before it is called done.


## Documentation check (before every commit)

From the Sprint 3 review: documentation drifted from the code (counts,
limits, file names). Before committing, read the parts of `README.md` and
`CLAUDE.md` that the change touches and check every number, path, command
and rule against the code:

- collections, globals and pages listed in the README exist under those names
- commands and scripts in the README run as written
- environment variables in the README match `.env.example` and the code
- anything "out of scope" in the README is still out of scope

Review reports (from reviewers or AI code review) are saved under
`docs/reviews/` and linked from the README, so they are findable later.
