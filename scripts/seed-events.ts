// Puts the Vouched application form, two example events, the events-page
// copy and the header links into the CMS.
// Run after seed-products.ts with: npx payload run scripts/seed-events.ts
// Safe to run twice: anything that already exists is left alone, so edits
// made in the admin panel are never overwritten. No real people's names.
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })

const paragraph = (text: string) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: [
      {
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        children: [{ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
      },
    ],
  },
})

// 1. The application form
const FORM_TITLE = 'Apply to Vouched'
let form = (
  await payload.find({ collection: 'forms', where: { title: { equals: FORM_TITLE } }, limit: 1 })
).docs[0]
if (form) {
  payload.logger.info('kept form (already there)')
} else {
  form = await payload.create({
    collection: 'forms',
    data: {
      title: FORM_TITLE,
      submitButtonLabel: 'Apply',
      confirmationType: 'message',
      confirmationMessage: paragraph(
        'Thank you. We read every application and will get back to you by email.',
      ),
      fields: [
        { blockType: 'text', name: 'name', label: 'Name', required: true, width: 50 },
        { blockType: 'email', name: 'email', label: 'Email', required: true, width: 50 },
        { blockType: 'text', name: 'company', label: 'Company', required: true, width: 50 },
        { blockType: 'text', name: 'role', label: 'Role', required: true, width: 50 },
        {
          blockType: 'select',
          name: 'side',
          label: 'Which side of the table are you on?',
          required: true,
          options: [
            { label: 'Founder', value: 'founder' },
            { label: 'Partner', value: 'partner' },
            { label: 'Decision-maker', value: 'decision-maker' },
          ],
        },
        {
          blockType: 'textarea',
          name: 'goal',
          label: 'What do you want from the table?',
          required: true,
        },
        { blockType: 'text', name: 'event', label: 'Event (optional)', required: false },
      ],
    },
  })
  payload.logger.info('created form')
}

// 2. The events-page copy points at the form (labels keep their defaults)
const copy = await payload.findGlobal({ slug: 'events-page', depth: 0 })
if (copy.applicationForm) {
  payload.logger.info('kept events-page (form already set)')
} else {
  await payload.updateGlobal({ slug: 'events-page', data: { applicationForm: form.id } })
  payload.logger.info('set events-page form')
}

// 3. Two example events
const bootcamp = (
  await payload.find({
    collection: 'products',
    where: { slug: { equals: 'partner-gtm-bootcamp' } },
    limit: 1,
  })
).docs[0]
if (!bootcamp) throw new Error('Run scripts/seed-products.ts first: the bootcamp product is missing.')

const events = [
  {
    title: 'Vouched Stammtisch – Munich',
    slug: 'vouched-stammtisch-munich',
    format: 'stammtisch' as const,
    date: '2027-01-14T18:00:00.000Z', // 19:00 in Munich
    location: 'Munich, venue shared with confirmed guests',
    seats: 30,
    summary:
      'The evening every six weeks where the Vouched community meets: founders, decision-makers, partners and investors. No agenda, no pitches, new ideas.',
    audience:
      'Vouched members and invited guests: founders, decision-makers, partners, investors and people from the industry.',
    host: 'Revenue without Noise',
  },
  {
    title: 'Vouched Table – Munich',
    slug: 'vouched-table-munich',
    format: 'table' as const,
    date: '2027-01-28T17:30:00.000Z', // 18:30 in Munich
    location: 'Munich, venue shared with confirmed guests',
    seats: 12,
    summary:
      'A small evening table for one group of decision-makers and the founders, partners and investors who want to meet them.',
    audience:
      'Decision-makers from one function, invited partners and investors, and a few founders as guests. Decision-makers, partners and investors never pay; they apply.',
    host: 'Revenue without Noise',
  },
  {
    title: 'Partner GTM Bootcamp – Munich',
    slug: 'partner-gtm-bootcamp-munich',
    format: 'bootcamp' as const,
    date: '2027-02-11T08:30:00.000Z', // 09:30 in Munich
    location: 'Munich',
    seats: 20,
    summary:
      'One day with twenty founders: partner ICP, a top-ten partner shortlist, a 90-day plan, and a peer check.',
    audience: 'Founders building a partner channel for a B2B AI product.',
    host: 'Revenue without Noise',
    product: bootcamp.id,
  },
]

for (const event of events) {
  const existing = await payload.find({
    collection: 'events',
    where: { slug: { equals: event.slug } },
    draft: true,
    limit: 1,
  })
  if (existing.docs.length > 0) {
    payload.logger.info(`kept ${event.slug} (already there)`)
    continue
  }
  await payload.create({
    collection: 'events',
    data: { ...event, generateSlug: false, _status: 'published' },
  })
  payload.logger.info(`created ${event.slug}`)
}

// 4. Header links, added only if no link to that URL exists yet
const header = await payload.findGlobal({ slug: 'header', depth: 0 })
const navItems = header.navItems ?? []
const wanted = [
  { label: 'Shop', url: '/shop' },
  { label: 'Events', url: '/events' },
  { label: 'Apply', url: '/apply' },
]
const missing = wanted.filter((w) => !navItems.some((item) => item.link?.url === w.url))
if (missing.length === 0) {
  payload.logger.info('kept header links (already there)')
} else {
  await payload.updateGlobal({
    slug: 'header',
    // Outside Next.js there is no page cache to revalidate.
    context: { disableRevalidate: true },
    data: {
      navItems: [
        ...navItems,
        ...missing.map((w) => ({ link: { type: 'custom' as const, url: w.url, label: w.label } })),
      ],
    },
  })
  payload.logger.info(`added header links: ${missing.map((w) => w.url).join(', ')}`)
}

process.exit(0)
