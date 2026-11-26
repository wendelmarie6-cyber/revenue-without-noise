// Makes the offering clearer (decided 26 Nov 2026): the shop is one path to a
// go-to-market that runs on trust – meet the right people, belong to Vouched,
// build it together, and at the end the individual build. The event formats
// get distinct names (Vouched AI Stammtisch, Vouched Roundtable).
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

// 1. Shop: one path, said at the top and named step by step
const shop = await payload.findGlobal({ slug: 'shop', depth: 0 })
const shopData = defined({
  heading: replaceIfSeeded(
    shop.heading,
    ['Join Vouched, or *book a session*', 'Join Vouched, *take a seat*, or book partner work'],
    'Go-to-market that runs *on trust*',
  ),
  intro: replaceIfSeeded(
    shop.intro,
    [
      'Memberships are billed monthly and can be cancelled. Seats and sessions are paid once.',
      'For B2B software teams building their partner and go-to-market motion. Three ways in: a monthly membership for your team, one seat or one day, or partner work with a clear result.',
    ],
    'For B2B software teams building their partner and go-to-market motion. Meet the right people, belong to the room, then build it together. Each step brings you closer to a pipeline that fills through partners, investors and customers who already trust you.',
  ),
})
const kinds = shop.kindLabels ?? {}
const kindData = defined({
  oneOff: replaceIfSeeded(kinds.oneOff, ['One-off', 'One seat, one day', null, undefined], 'Meet the right people'),
  membership: replaceIfSeeded(
    kinds.membership,
    ['Membership', 'Vouched membership', null, undefined],
    'Belong: Vouched membership',
  ),
  service: replaceIfSeeded(kinds.service, ['Service', 'Partner services', null, undefined], 'Build it together'),
})
const intros = shop.kindIntros ?? {}
const introData = defined({
  oneOff: replaceIfSeeded(
    intros.oneOff,
    [null, undefined, ''],
    'One seat at one table, or one day with twenty founders. No subscription: trust starts with a conversation.',
  ),
  membership: replaceIfSeeded(
    intros.membership,
    [null, undefined, ''],
    'The same faces, regularly. Trust grows with time and consistency, and with it come the intros to partners, investors and customers. Monthly, by team size.',
  ),
  service: replaceIfSeeded(
    intros.service,
    [null, undefined, ''],
    'Turn the right contacts into a partner channel: which partner types fit and who first, then partner ICP, shortlist and first intros. Hands-on, not on slides.',
  ),
})
const custom = shop.custom ?? {}
const customData = defined({
  heading: replaceIfSeeded(custom.heading, ['Something *bigger* in mind?'], 'Your go-to-market, *running*'),
  text: replaceIfSeeded(
    custom.text,
    ['Go-to-market builds are configured individually, for your stage and your buyers. Price on request.'],
    'The full build, configured for your stage and your buyers: positioning, partner channels, access to investors and decision-makers, a funnel that scales. Price on request.',
  ),
})
await payload.updateGlobal({
  slug: 'shop',
  data: {
    ...shopData,
    ...(Object.keys(kindData).length ? { kindLabels: { ...kinds, ...kindData } } : {}),
    ...(Object.keys(introData).length ? { kindIntros: { ...intros, ...introData } } : {}),
    ...(Object.keys(customData).length ? { custom: { ...custom, ...customData } } : {}),
  },
  context: ctx,
})
payload.logger.info(
  `shop: ${[...Object.keys(shopData), ...Object.keys(kindData), ...Object.keys(introData), ...Object.keys(customData)].join(', ') || 'kept'}`,
)

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
