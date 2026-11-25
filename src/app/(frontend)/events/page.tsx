import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { PageIntro } from '@/components/PageIntro'
import { formatEventDate } from '@/utilities/events'

// Read on every request, so an event published in the admin panel is live at once.
export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const payload = await getPayload({ config: configPromise })
  const [copy, events] = await Promise.all([
    payload.findGlobal({ slug: 'events-page' }),
    payload.find({
      collection: 'events',
      overrideAccess: false, // as a visitor: only published events
      where: { date: { greater_than_equal: new Date().toISOString() } },
      sort: 'date',
      depth: 0,
      limit: 50,
    }),
  ])

  return (
    <div className="brand-glow">
    <div className="container pt-20 pb-24">
      <PageIntro kicker={copy.kicker} heading={copy.heading} intro={copy.intro} />

      {events.docs.length === 0 ? (
        <p className="text-muted-foreground">{copy.emptyText}</p>
      ) : (
        <ul className="grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3">
          {events.docs.map((event, i) => (
            <li key={event.id} className="flex flex-col gap-4 border-r border-b border-border p-7">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                <span className="text-primary">{String(i + 1).padStart(2, '0')}</span> ·{' '}
                {copy.formatLabels[event.format]}
              </p>
              <h2 className="text-2xl leading-tight">{event.title}</h2>
              <p className="text-sm text-foreground">
                {formatEventDate(event.date)} · {event.location}
              </p>
              {event.summary && (
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  {event.summary}
                </p>
              )}
              <Link
                href={`/events/${event.slug}`}
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                {copy.moreLabel} →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config: configPromise })
  const copy = await payload.findGlobal({ slug: 'events-page' })
  return { title: copy.heading.replaceAll('*', '') }
}
