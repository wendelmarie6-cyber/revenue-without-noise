import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type Stripe from 'stripe'

import { paidUpdate } from '@/stripe/fulfilment'
import { stripe } from '@/stripe/server'

// The only door through which an order becomes paid. Reaching the
// thank-you page proves nothing; a signed event from Stripe does.
export async function POST(req: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return new Response('Webhook secret is not configured', { status: 500 })

  const signature = req.headers.get('stripe-signature')
  if (!signature) return new Response('Missing signature', { status: 400 })

  // The signature covers the exact bytes Stripe sent, so read the raw text,
  // never a parsed and re-serialised body.
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe().webhooks.constructEvent(body, signature, secret)
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  // For the course only the first confirmation is handled. Renewals,
  // cancellations and failed charges are separate events, acknowledged here
  // so Stripe stops retrying them.
  if (event.type !== 'checkout.session.completed') {
    return Response.json({ received: true, handled: false })
  }

  const session = event.data.object
  const payload = await getPayload({ config: configPromise })
  const orderId = session.metadata?.orderId
  const order = orderId
    ? await payload.findByID({ collection: 'orders', id: orderId, disableErrors: true })
    : null

  if (!order) {
    payload.logger.warn(`Stripe webhook: no order for session ${session.id}`)
    return Response.json({ received: true, handled: false })
  }

  const verdict = paidUpdate(session, order)
  if (!verdict.ok) {
    payload.logger.info(`Stripe webhook: order ${order.id} not changed (${verdict.reason})`)
    return Response.json({ received: true, handled: false })
  }

  await payload.update({ collection: 'orders', id: order.id, data: verdict.data })
  payload.logger.info(`Stripe webhook: order ${order.id} paid`)
  return Response.json({ received: true, handled: true })
}
