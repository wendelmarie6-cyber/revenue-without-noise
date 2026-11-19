import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

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
      <div className="container pt-16 pb-24">
        <div className="prose dark:prose-invert max-w-2xl">
          <h1 data-order-status={order?.status ?? 'unknown'}>{heading}</h1>
          {order && <p className="font-medium">{order.productName}</p>}
          {text && <p>{text}</p>}
          <p>
            <Link href="/shop">{shop.backLabel}</Link>
          </p>
        </div>
        {order?.status === 'pending' && <RefreshWhilePending />}
      </div>
    </>
  )
}
