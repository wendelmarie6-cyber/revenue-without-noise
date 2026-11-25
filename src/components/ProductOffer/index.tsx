import React from 'react'

import type { Product, Shop } from '@/payload-types'

import { startCheckout } from '@/app/(frontend)/shop/actions'

const euros = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' })

type Labels = Pick<Shop, 'perMonthLabel' | 'subscribeLabel' | 'buyLabel'>

/** Price as shown everywhere: "€49.00 per month" for memberships, "€39.00" otherwise. */
export const ProductPrice: React.FC<{ product: Product; labels: Labels }> = ({
  product,
  labels,
}) => (
  <p className="font-serif text-3xl tracking-tight">
    {euros.format(product.price)}
    {product.kind === 'membership' && (
      <span className="ml-2 font-sans text-sm text-muted-foreground">{labels.perMonthLabel}</span>
    )}
  </p>
)

/**
 * The buy button. The browser sends only the slug; the server reads name and
 * price from the CMS and starts Stripe Checkout (see shop/actions.ts).
 */
export const BuyButton: React.FC<{ product: Product; labels: Labels; className?: string }> = ({
  product,
  labels,
  className,
}) => (
  <form action={startCheckout} className={className}>
    <input type="hidden" name="slug" value={product.slug ?? ''} />
    <button
      type="submit"
      className="w-full border border-primary px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-primary"
    >
      {product.kind === 'membership' ? labels.subscribeLabel : labels.buyLabel} →
    </button>
  </form>
)
