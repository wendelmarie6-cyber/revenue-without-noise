import configPromise from '@payload-config'
import type { Form } from '@payloadcms/plugin-form-builder/types'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import { FormBlock } from '@/blocks/Form/Component'
import { Emphasis } from '@/components/Emphasis'
import { BuyButton, ProductPrice } from '@/components/ProductOffer'
import { TestModeBanner } from '@/components/TestModeBanner'
import { formatEventDate, withEventPrefilled } from '@/utilities/events'

export const dynamic = 'force-dynamic'

type Args = { params: Promise<{ slug: string }> }

async function findEvent(slug: string) {
  const payload = await getPayload({ config: configPromise })
  const found = await payload.find({
    collection: 'events',
    where: { slug: { equals: slug } },
    overrideAccess: false, // as a visitor: only published events and products
    depth: 1,
    limit: 1,
  })
  return found.docs[0]
}

export default async function EventPage({ params }: Args) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })
  const [event, copy, shop] = await Promise.all([
    findEvent(slug),
    payload.findGlobal({ slug: 'events-page', depth: 1 }),
    payload.findGlobal({ slug: 'shop' }),
  ])
  if (!event) notFound()

  // A draft or deleted product comes back as an id or null: then there is nothing to buy.
  const product = event.product && typeof event.product === 'object' ? event.product : null
  const form =
    copy.applicationForm && typeof copy.applicationForm === 'object'
      ? withEventPrefilled(copy.applicationForm as unknown as Form, event.title)
      : null

  return (
    <>
      {product && <TestModeBanner text={shop.testModeNotice} />}
      <div className="brand-glow">
        <div className="container pt-16 pb-24">
          <Link
            href="/events"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← {copy.backLabel}
          </Link>

          <div className="mt-10 max-w-3xl">
            <p className="kicker mb-6">{copy.formatLabels[event.format]}</p>
            <h1 className="text-[2.75rem] leading-[1.05] md:text-6xl">{event.title}</h1>
            {event.summary && (
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{event.summary}</p>
            )}
          </div>

          <dl className="mt-12 mb-14 grid max-w-4xl border-l border-t border-border sm:grid-cols-2">
            {[
              [copy.labels.date, formatEventDate(event.date)],
              [copy.labels.location, event.location],
              event.seats ? [copy.labels.seats, String(event.seats)] : null,
              event.host ? [copy.labels.host, event.host] : null,
              [copy.labels.audience, event.audience],
            ]
              .filter((row): row is [string, string] => Boolean(row && row[1]))
              .map(([label, value]) => (
                <div key={label} className="border-r border-b border-border p-6 last:sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-2">{value}</dd>
                </div>
              ))}
          </dl>

          {product && (
            <section className="mb-16 flex max-w-4xl flex-col gap-5 border border-border p-8">
              <h2 className="text-3xl leading-tight">{product.name}</h2>
              {copy.paidNote && <p className="text-muted-foreground">{copy.paidNote}</p>}
              <ProductPrice product={product} labels={shop} />
              <BuyButton product={product} labels={shop} className="sm:max-w-xs" />
            </section>
          )}

          {form && (
            <section className="max-w-4xl">
              {copy.applyKicker && <p className="kicker mb-5">{copy.applyKicker}</p>}
              <h2 className="text-4xl leading-tight">
                <Emphasis text={copy.applyHeading} />
              </h2>
              {copy.applyIntro && (
                <p className="mt-4 mb-8 text-muted-foreground">{copy.applyIntro}</p>
              )}
              <FormBlock className="max-w-3xl" enableIntro={false} form={form} />
            </section>
          )}
        </div>
      </div>
    </>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const event = await findEvent(slug)
  return { title: event?.title }
}
