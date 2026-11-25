import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { Emphasis } from '@/components/Emphasis'
import { TestModeBanner } from '@/components/TestModeBanner'
import { RefreshWhilePending } from './RefreshWhilePending'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ session_id?: string }> }

// Arriving here proves nothing about payment. The page only reports what the
// verified webhook has written into the order.
export default async function ThankYouPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams
  const payload = await getPayload({ config: configPromise })
  const shop = await payload.findGlobal({ slug: 'shop' })

  const found = sessionId
    ? await payload.find({
        collection: 'orders',
        where: { stripeSessionId: { equals: sessionId } },
        depth: 0,
        limit: 1,
        select: { status: true, productName: true },
      })
    : null
  const order = found?.docs[0]

  let heading = shop.unknownHeading
  let text: string | null | undefined = null
  if (order?.status === 'paid') {
    heading = shop.paidHeading
    text = shop.paidText
  } else if (order) {
    heading = shop.pendingHeading
    text = shop.pendingText
  }

  return (
    <>
      <TestModeBanner text={shop.testModeNotice} />
      <div className="brand-glow">
      <div className="container pt-20 pb-24">
        <div className="max-w-2xl">
          {order && <p className="kicker mb-6">{order.productName}</p>}
          <h1
            data-order-status={order?.status ?? 'unknown'}
            className="text-[2.75rem] leading-[1.05] md:text-6xl"
          >
            <Emphasis text={heading} />
          </h1>
          {text && <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{text}</p>}
          <Link
            href="/shop"
            className="mt-10 inline-block border border-input px-5 py-3 text-sm transition-colors hover:border-primary hover:text-primary"
          >
            ← {shop.backLabel}
          </Link>
        </div>
        {order?.status === 'pending' && <RefreshWhilePending />}
      </div>
      </div>
    </>
  )
}
