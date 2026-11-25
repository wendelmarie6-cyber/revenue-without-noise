import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { PageIntro } from '@/components/PageIntro'
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
      <div className="container pt-20 pb-24">
        <PageIntro heading={shop.cancelledHeading} intro={shop.cancelledText}>
          <Link
            href="/shop"
            className="mt-10 inline-block border border-input px-5 py-3 text-sm transition-colors hover:border-primary hover:text-primary"
          >
            ← {shop.backLabel}
          </Link>
        </PageIntro>
      </div>
    </>
  )
}
