# Evidence: declined card and successful purchase (25 Nov 2026)

One checkout for *Roundtable seat* (39 €), local dev server against the
shared database, Stripe sandbox, webhooks forwarded with `scripts/stripe-listen.sh`.

1. **Declined card** `4000 0000 0000 0002` → Stripe shows "Your card was
   declined" ([01-decline-card-on-stripe.jpg](01-decline-card-on-stripe.jpg)).
   No webhook arrived. The order in the database stayed `pending`:

   | id | product | status |
   |---|---|---|
   | 12 | Roundtable seat | pending |

2. **Same checkout, success card** `4242 4242 4242 4242` → Stripe sent
   `checkout.session.completed`, the app answered `200`:

   ```
   2026-11-25 14:13:11   --> checkout.session.completed [evt_1Ufg0ZKqqtMQ74Q5p5JxL6fH]
   2026-11-25 14:13:12  <--  [200] POST http://localhost:3001/api/stripe/webhook
   ```

   Only then did the order turn paid:

   | id | product | status | amount_paid | paid_at |
   |---|---|---|---|---|
   | 12 | Roundtable seat | paid | 3900 | 2026-11-25T13:13:12Z |

   The thank-you page shows the confirmed purchase
   ([02-thank-you-paid.jpg](02-thank-you-paid.jpg)).

The same flow was run on the live Vercel site with the success card on
25 Nov (order 10, paid via the live webhook).
