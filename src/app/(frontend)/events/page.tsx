import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

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
    <div className="container pt-16 pb-24">
      <div className="prose dark:prose-invert max-w-none mb-12">
        <h1>{copy.heading}</h1>
        {copy.intro && <p>{copy.intro}</p>}
      </div>

      {events.docs.length === 0 ? (
        <p className="text-muted-foreground">{copy.emptyText}</p>
      ) : (
        <ul className="grid gap-8 sm:grid-cols-2">
          {events.docs.map((event) => (
            <li
              key={event.id}
              className="flex flex-col gap-3 border border-border rounded-lg p-6 bg-card"
            >
              <p className="text-sm uppercase tracking-wide text-muted-foreground">
                {copy.formatLabels[event.format]}
              </p>
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <p>
                {formatEventDate(event.date)} · {event.location}
              </p>
              {event.summary && <p className="flex-1 text-muted-foreground">{event.summary}</p>}
              <Link href={`/events/${event.slug}`} className="font-medium underline">
                {copy.moreLabel}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config: configPromise })
  const copy = await payload.findGlobal({ slug: 'events-page' })
  return { title: copy.heading }
}
