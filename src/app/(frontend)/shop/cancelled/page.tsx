import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { TestModeBanner } from '@/components/TestModeBanner'

export const dynamic = 'force-dynamic'

// Stripe sends the customer here when they leave Checkout without paying.
// The order simply stays pending: only the verified webhook marks it paid.
export default async function CancelledPage() {
  const payload = await getPayload({ config: configPromise })
  const shop = await payload.findGlobal({ slug: 'shop' })

  return (
    <>
      <TestModeBanner text={shop.testModeNotice} />
      <div className="container pt-16 pb-24">
        <div className="prose dark:prose-invert max-w-2xl">
          <h1>{shop.cancelledHeading}</h1>
          {shop.cancelledText && <p>{shop.cancelledText}</p>}
          <p>
            <Link href="/shop">{shop.backLabel}</Link>
          </p>
        </div>
      </div>
    </>
  )
}
