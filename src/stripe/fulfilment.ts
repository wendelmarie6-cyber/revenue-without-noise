// The one place that decides whether a Stripe event makes an order paid.
// Pure: no network, no database. The webhook route calls it after the
// signature has been verified; nothing else may set an order to paid.

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
