'use server'

import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import type Stripe from 'stripe'

import { stripe } from '@/stripe/server'
import { CURRENCY, toCents } from '@/stripe/fulfilment'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * Starts a Stripe Checkout for one product. Only the slug comes from the
 * browser; the name and price are read from the CMS here, so a visitor
 * cannot change what they pay. The order starts as pending and only the
 * verified webhook may mark it paid.
 */
export async function startCheckout(formData: FormData): Promise<void> {
  const slug = String(formData.get('slug') ?? '')
  const payload = await getPayload({ config: configPromise })

  const found = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    overrideAccess: false, // as a visitor: only published products
    depth: 0,
    limit: 1,
  })
  const product = found.docs[0]
  if (!product) throw new Error('This product is not available.')

  const amount = toCents(product.price)
  const membership = product.kind === 'membership'

  const order = await payload.create({
    collection: 'orders',
    data: {
      product: product.id,
      productName: product.name,
      kind: product.kind,
      amount,
      status: 'pending',
    },
  })

  const base = getServerSideURL()
  let session: Stripe.Checkout.Session
  let checkoutUrl: string
  try {
    session = await stripe().checkout.sessions.create({
      mode: membership ? 'subscription' : 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: amount,
            product_data: { name: product.name },
            ...(membership ? { recurring: { interval: 'month' as const } } : {}),
          },
        },
      ],
      client_reference_id: String(order.id),
      metadata: { orderId: String(order.id) },
      success_url: `${base}/shop/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/shop/cancelled`,
    })
    if (!session.url) throw new Error('Stripe did not return a checkout page.')
    checkoutUrl = session.url
  } catch (error) {
    // No checkout page means nothing can ever pay this order: remove it, so
    // the Orders list only shows orders a customer could actually complete.
    await payload.delete({ collection: 'orders', id: order.id })
    throw error
  }

  await payload.update({
    collection: 'orders',
    id: order.id,
    data: { stripeSessionId: session.id },
  })

  redirect(checkoutUrl)
}
