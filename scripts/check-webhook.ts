// End-to-end check of the paid-only-by-webhook rule against the running dev server.
// Run with: npx payload run scripts/check-webhook.ts   (dev server on port 3001)
//
// 1. creates a pending order, as the checkout action does
// 2. posts a forged, unsigned "paid" event  -> must be rejected, order stays pending
// 3. posts the same event signed with STRIPE_WEBHOOK_SECRET -> order becomes paid
// 4. posts it again -> nothing changes (Stripe retries are harmless)
// The test order is deleted at the end.
import config from '@payload-config'
import { getPayload } from 'payload'
import Stripe from 'stripe'

const base = process.env.CHECK_URL ?? 'http://localhost:3001'
const secret = process.env.STRIPE_WEBHOOK_SECRET
if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not set')

const payload = await getPayload({ config })
const product = (await payload.find({ collection: 'products', limit: 1, depth: 0 })).docs[0]
if (!product) throw new Error('No product to test with')

const sessionId = `cs_test_selfcheck_${Date.now()}`
const order = await payload.create({
  collection: 'orders',
  data: {
    product: product.id,
    productName: product.name,
    kind: product.kind,
    amount: Math.round(product.price * 100),
    status: 'pending',
    stripeSessionId: sessionId,
  },
})

const body = JSON.stringify({
  id: `evt_selfcheck_${Date.now()}`,
  object: 'event',
  type: 'checkout.session.completed',
  data: {
    object: {
      id: sessionId,
      object: 'checkout.session',
      payment_status: 'paid',
      amount_total: Math.round(product.price * 100),
      currency: 'eur',
      customer_details: { email: 'buyer@example.com' },
      subscription: null,
      metadata: { orderId: String(order.id) },
    },
  },
})

async function post(signature: string | null) {
  const res = await fetch(`${base}/api/stripe/webhook`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(signature ? { 'stripe-signature': signature } : {}) },
    body,
  })
  const status = (await payload.findByID({ collection: 'orders', id: order.id })).status
  return `${res.status} -> order ${status}`
}

const results: string[] = []
results.push(`forged, no signature:  ${await post(null)}`)
results.push(`forged, bad signature: ${await post('t=1,v1=deadbeef')}`)
const signed = new Stripe('sk_test_unused').webhooks.generateTestHeaderString({ payload: body, secret })
results.push(`signed by Stripe secret: ${await post(signed)}`)
results.push(`same event again:        ${await post(signed)}`)

await payload.delete({ collection: 'orders', id: order.id })
console.log(results.join('\n'))
process.exit(0)
