// Server-side Stripe client. Imported only by the checkout action and the
// webhook route, never by a client component: the secret key must not reach
// the browser bundle.
import Stripe from 'stripe'

let client: Stripe | undefined

export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  // This shop runs in test mode only. A live key is refused, not used.
  if (!key.startsWith('sk_test_') && !key.startsWith('rk_test_')) {
    throw new Error('Only Stripe test keys are allowed in this project')
  }
  client ??= new Stripe(key)
  return client
}
