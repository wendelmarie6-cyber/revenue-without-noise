// The one place that decides whether a Stripe event makes an order paid.
// Pure: no network, no database. The webhook route calls it after the
// signature has been verified; nothing else may set an order to paid.

/** The one currency the shop charges in. Checkout and the paid check both use it. */
export const CURRENCY = 'eur'

/**
 * Stripe events that may turn an order paid: a completed checkout, and a
 * delayed payment method (such as SEPA Direct Debit) that succeeded later.
 */
const PAYING_EVENTS = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
])

export function canMarkPaid(eventType: string): boolean {
  return PAYING_EVENTS.has(eventType)
}

export type SessionFacts = {
  id: string
  payment_status: string
  amount_total: number | null
  currency: string | null
  customer_details?: { email?: string | null } | null
  subscription?: string | { id: string } | null
}

export type OrderFacts = {
  status: 'pending' | 'paid'
  stripeSessionId?: string | null
  /** Expected amount in cents, fixed at checkout. */
  amount: number
}

export type PaidUpdate = {
  status: 'paid'
  paidAt: string
  amountPaid: number | null
  currency: string | null
  customerEmail: string | null
  stripeSubscriptionId: string | null
}

export type Verdict = { ok: true; data: PaidUpdate } | { ok: false; reason: string }

/** Euros as the admin types them, cents as Stripe wants them. */
export function toCents(euros: number): number {
  return Math.round(euros * 100)
}

export function paidUpdate(session: SessionFacts, order: OrderFacts, now = new Date()): Verdict {
  if (order.status === 'paid') {
    // Stripe may deliver the same event twice; the second time changes nothing.
    return { ok: false, reason: 'already paid' }
  }
  if (!order.stripeSessionId || order.stripeSessionId !== session.id) {
    // The metadata names an order that was not started by this checkout.
    return { ok: false, reason: 'session does not belong to this order' }
  }
  if (session.payment_status !== 'paid') {
    // Completed is not the same as paid: some payment methods settle later.
    return { ok: false, reason: `payment status is ${session.payment_status}` }
  }
  if (session.amount_total !== order.amount || session.currency !== CURRENCY) {
    // The server set both at checkout; anything else must not count as paid.
    return {
      ok: false,
      reason: `amount ${session.amount_total} ${session.currency} does not match the expected ${order.amount} ${CURRENCY}`,
    }
  }

  const subscription =
    typeof session.subscription === 'string'
      ? session.subscription
      : (session.subscription?.id ?? null)

  return {
    ok: true,
    data: {
      status: 'paid',
      paidAt: now.toISOString(),
      amountPaid: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_details?.email ?? null,
      stripeSubscriptionId: subscription,
    },
  }
}
