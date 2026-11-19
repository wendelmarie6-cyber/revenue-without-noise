import configPromise from '@payload-config'
import type { Form } from '@payloadcms/plugin-form-builder/types'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import { FormBlock } from '@/blocks/Form/Component'
import { TestModeBanner } from '@/components/TestModeBanner'
import { formatEventDate, withEventPrefilled } from '@/utilities/events'
import { startCheckout } from '../../shop/actions'

export const dynamic = 'force-dynamic'

const euros = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' })

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
      <div className="container pt-16 pb-24">
        <Link href="/events" className="text-sm underline">
          {copy.backLabel}
        </Link>

        <div className="prose dark:prose-invert max-w-none mt-6 mb-10">
          <p className="text-sm uppercase tracking-wide">{copy.formatLabels[event.format]}</p>
          <h1>{event.title}</h1>
          {event.summary && <p className="lead">{event.summary}</p>}
          <dl>
            <dt>{copy.labels.date}</dt>
            <dd>{formatEventDate(event.date)}</dd>
            <dt>{copy.labels.location}</dt>
            <dd>{event.location}</dd>
            {event.seats ? (
              <>
                <dt>{copy.labels.seats}</dt>
                <dd>{event.seats}</dd>
              </>
            ) : null}
            <dt>{copy.labels.audience}</dt>
            <dd>{event.audience}</dd>
            {event.host ? (
              <>
                <dt>{copy.labels.host}</dt>
                <dd>{event.host}</dd>
              </>
            ) : null}
          </dl>
        </div>

        {product && (
          <section className="mb-12 max-w-[48rem] border border-border rounded-lg p-6 bg-card flex flex-col gap-4">
            <h2 className="text-xl font-semibold">{product.name}</h2>
            {copy.paidNote && <p className="text-muted-foreground">{copy.paidNote}</p>}
            <p className="text-2xl font-bold">
              {euros.format(product.price)}
              {product.kind === 'membership' && (
                <span className="text-base font-normal text-muted-foreground">
                  {' '}
                  {shop.perMonthLabel}
                </span>
              )}
            </p>
            <form action={startCheckout}>
              <input type="hidden" name="slug" value={product.slug ?? ''} />
              <button
                type="submit"
                className="rounded-md bg-primary text-primary-foreground px-4 py-2 font-medium hover:opacity-90"
              >
                {product.kind === 'membership' ? shop.subscribeLabel : shop.buyLabel}
              </button>
            </form>
          </section>
        )}

        {form && (
          <section>
            <div className="prose dark:prose-invert max-w-none mb-6">
              <h2>{copy.applyHeading}</h2>
              {copy.applyIntro && <p>{copy.applyIntro}</p>}
            </div>
            <FormBlock enableIntro={false} form={form} />
          </section>
        )}
      </div>
    </>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const event = await findEvent(slug)
  return { title: event?.title }
}
