import { describe, expect, it } from 'vitest'

import { canMarkPaid, paidUpdate, toCents, type SessionFacts } from '@/stripe/fulfilment'

const session: SessionFacts = {
  id: 'cs_test_1',
  payment_status: 'paid',
  amount_total: 19000,
  currency: 'eur',
  customer_details: { email: 'buyer@example.com' },
  subscription: null,
}
const pending = { status: 'pending' as const, stripeSessionId: 'cs_test_1', amount: 19000 }
const now = new Date('2026-11-12T12:00:00Z')

describe('paidUpdate', () => {
  it('marks a pending order paid when its own session was paid', () => {
    expect(paidUpdate(session, pending, now)).toEqual({
      ok: true,
      data: {
        status: 'paid',
        paidAt: '2026-11-12T12:00:00.000Z',
        amountPaid: 19000,
        currency: 'eur',
        customerEmail: 'buyer@example.com',
        stripeSubscriptionId: null,
      },
    })
  })

  it('changes nothing when the same event arrives twice', () => {
    expect(paidUpdate(session, { ...pending, status: 'paid' }, now)).toEqual({
      ok: false,
      reason: 'already paid',
    })
  })

  it('refuses a session that belongs to another order', () => {
    expect(paidUpdate(session, { ...pending, stripeSessionId: 'cs_test_other' }, now).ok).toBe(
      false,
    )
  })

  it('refuses an order that never started a checkout', () => {
    expect(paidUpdate(session, { ...pending, stripeSessionId: null }, now).ok).toBe(false)
  })

  it('does not count a completed but unpaid session', () => {
    expect(paidUpdate({ ...session, payment_status: 'unpaid' }, pending, now)).toEqual({
      ok: false,
      reason: 'payment status is unpaid',
    })
  })

  it('refuses a payment that does not match the expected amount', () => {
    expect(paidUpdate({ ...session, amount_total: 100 }, pending, now)).toEqual({
      ok: false,
      reason: 'amount 100 eur does not match the expected 19000 eur',
    })
  })

  it('refuses a payment in another currency', () => {
    expect(paidUpdate({ ...session, currency: 'usd' }, pending, now).ok).toBe(false)
  })

  it('keeps the subscription id of a membership', () => {
    const result = paidUpdate({ ...session, subscription: { id: 'sub_test_1' } }, pending, now)
    expect(result.ok && result.data.stripeSubscriptionId).toBe('sub_test_1')
  })
})

describe('canMarkPaid', () => {
  it('accepts a completed checkout and a delayed payment that succeeded later', () => {
    expect(canMarkPaid('checkout.session.completed')).toBe(true)
    expect(canMarkPaid('checkout.session.async_payment_succeeded')).toBe(true)
  })

  it('ignores every other event', () => {
    expect(canMarkPaid('checkout.session.async_payment_failed')).toBe(false)
    expect(canMarkPaid('invoice.paid')).toBe(false)
  })
})

describe('toCents', () => {
  it('turns euros into whole cents without float drift', () => {
    expect(toCents(19)).toBe(1900)
    expect(toCents(1900)).toBe(190000)
    expect(toCents(0.29)).toBe(29)
    expect(toCents(19.99)).toBe(1999)
  })
})
