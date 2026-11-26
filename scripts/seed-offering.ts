// Makes the offering clearer (decided 26 Nov 2026): the shop is grouped into
// Vouched membership, one seat or one day, and partner services, and the event
// formats get distinct names (Vouched AI Stammtisch, Vouched Roundtable).
// Safe to run twice: a text is only replaced while it still has its earlier
// seeded value, so anything edited in the admin panel is left alone.
// Against the live database run it with NODE_ENV=production, so Payload does
// not change the schema on start:
//   NODE_ENV=production DATABASE_POOL_MAX=2 npx payload run scripts/seed-offering.ts
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })
const ctx = { disableRevalidate: true }

const replaceIfSeeded = (current: unknown, old: (string | null | undefined)[], next: string) =>
  old.includes(current as string) ? next : undefined
const defined = <T extends object>(o: T) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>

// 1. Shop: who it is for and the three ways in, said at the top
const shop = await payload.findGlobal({ slug: 'shop', depth: 0 })
const shopData = defined({
  heading: replaceIfSeeded(
    shop.heading,
    ['Join Vouched, or *book a session*'],
    'Join Vouched, *take a seat*, or book partner work',
  ),
  intro: replaceIfSeeded(
    shop.intro,
    ['Memberships are billed monthly and can be cancelled. Seats and sessions are paid once.'],
    'For B2B software teams building their partner and go-to-market motion. Three ways in: a monthly membership for your team, one seat or one day, or partner work with a clear result.',
  ),
})
const kinds = shop.kindLabels ?? {}
const kindData = defined({
  membership: replaceIfSeeded(kinds.membership, ['Membership', null, undefined], 'Vouched membership'),
  oneOff: replaceIfSeeded(kinds.oneOff, ['One-off', null, undefined], 'One seat, one day'),
  service: replaceIfSeeded(kinds.service, ['Service', null, undefined], 'Partner services'),
})
await payload.updateGlobal({
  slug: 'shop',
  data: { ...shopData, ...(Object.keys(kindData).length ? { kindLabels: { ...kinds, ...kindData } } : {}) },
  context: ctx,
})
payload.logger.info(`shop: ${[...Object.keys(shopData), ...Object.keys(kindData)].join(', ') || 'kept'}`)

// 2. Event formats: distinct names
const page = await payload.findGlobal({ slug: 'events-page', depth: 0 })
const labels = page.formatLabels
const labelData = defined({
  stammtisch: replaceIfSeeded(labels?.stammtisch, ['Stammtisch'], 'AI Stammtisch'),
  table: replaceIfSeeded(labels?.table, ['Table'], 'Roundtable'),
})
if (Object.keys(labelData).length) {
  await payload.updateGlobal({
    slug: 'events-page',
    data: { formatLabels: { ...labels, ...labelData } },
    context: ctx,
  })
}
payload.logger.info(`format labels: ${Object.keys(labelData).join(', ') || 'kept'}`)

const titles: [string, string, string][] = [
  ['vouched-stammtisch-munich', 'Vouched Stammtisch – Munich', 'Vouched AI Stammtisch – Munich'],
  ['vouched-table-munich', 'Vouched Table – Munich', 'Vouched Roundtable – Munich'],
]
for (const [slug, old, next] of titles) {
  const { docs } = await payload.find({
    collection: 'events',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  const event = docs[0]
  if (event && event.title === old) {
    await payload.update({ collection: 'events', id: event.id, data: { title: next }, context: ctx })
    payload.logger.info(`event ${slug}: renamed`)
  } else {
    payload.logger.info(`event ${slug}: kept`)
  }
}

process.exit(0)
