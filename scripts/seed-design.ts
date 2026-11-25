// Brings the CMS copy in line with revenuewithoutnoise.com (same wording,
// kicker lines, green italic emphasis) and links the shop to the main site.
// Run once with: DATABASE_POOL_MAX=2 npx payload run scripts/seed-design.ts
// Safe to run twice: a text is only replaced while it still has its earlier
// seeded value, so anything edited in the admin panel is left alone.
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })
const ctx = { disableRevalidate: true }
const WEBSITE = 'https://revenuewithoutnoise.com'

/** Returns `next` only where the current value is still one of the old seeded ones. */
const replaceIfSeeded = (current: unknown, old: (string | null | undefined)[], next: string) =>
  old.includes(current as string) ? next : undefined
const defined = <T extends object>(o: T) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>

// 1. Shop and events headings in the website's voice
const shop = await payload.findGlobal({ slug: 'shop', depth: 0 })
const shopData = defined({
  heading: replaceIfSeeded(
    shop.heading,
    ['Join Vouched and book a session', 'Join Vouched, or book a session'],
    'Join Vouched, or *book a session*',
  ),
})
await payload.updateGlobal({ slug: 'shop', data: shopData, context: ctx })
payload.logger.info(`shop: ${Object.keys(shopData).join(', ') || 'kept'}`)

const events = await payload.findGlobal({ slug: 'events-page', depth: 0 })
const eventsData = defined({
  heading: replaceIfSeeded(events.heading, ['Vouched Tables'], 'The right people. *Regularly at one table.*'),
  intro: replaceIfSeeded(
    events.intro,
    [
      'Small, invitation-only rounds in Munich. Founders, the partners who implement, and the decision-makers who buy sit at one table. Never a sales event.',
    ],
    'Vouched brings founders, decision-makers, partners, investors and people from the industry together – in small, recurring formats in Munich. Never a sales event. You leave with new ideas, and conversations turn into customers, partners or investors.',
  ),
  applyHeading: replaceIfSeeded(events.applyHeading, ['Apply to Vouched'], 'Apply for *a seat at the table*'),
  applyIntro: replaceIfSeeded(
    events.applyIntro,
    [
      'Decision-makers and partners never pay; they apply. Tell us who you are and what you want from the table.',
    ],
    'Decision-makers, partners and investors apply and never pay. That keeps the table what it is meant to be. Tell us who you are and what you want from it.',
  ),
})
await payload.updateGlobal({ slug: 'events-page', data: eventsData, context: ctx })
payload.logger.info(`events-page: ${Object.keys(eventsData).join(', ') || 'kept'}`)

// 2. Header button and footer links to the main website
const header = await payload.findGlobal({ slug: 'header', depth: 0 })
if (!header.cta?.url) {
  await payload.updateGlobal({
    slug: 'header',
    data: { cta: { label: 'Book a call', url: `${WEBSITE}/#kontakt` } },
    context: ctx,
  })
  payload.logger.info('header: added "Book a call"')
}

const footer = await payload.findGlobal({ slug: 'footer', depth: 0 })
if ((footer.navItems ?? []).length === 0) {
  const links = [
    { label: 'revenuewithoutnoise.com ↗', url: WEBSITE },
    { label: 'Offer', url: `${WEBSITE}/#angebot` },
    { label: 'Vouched', url: `${WEBSITE}/#vouched` },
    { label: 'Contact', url: `${WEBSITE}/#kontakt` },
  ]
  await payload.updateGlobal({
    slug: 'footer',
    data: {
      note: footer.note ?? 'Go-to-market for B2B founders in DACH.',
      navItems: links.map((l) => ({ link: { type: 'custom' as const, ...l } })),
    },
    context: ctx,
  })
  payload.logger.info('footer: added links to the main website')
}

// 3. Investors apply too (the website lists them): add the missing choice
const form = (
  await payload.find({ collection: 'forms', where: { title: { equals: 'Apply to Vouched' } }, limit: 1 })
).docs[0]
const side = form?.fields?.find((f) => f.blockType === 'select' && f.name === 'side')
if (form && side?.blockType === 'select' && !side.options?.some((o) => o.value === 'investor')) {
  side.options = [...(side.options ?? []), { label: 'Investor', value: 'investor' }]
  await payload.update({ collection: 'forms', id: form.id, data: { fields: form.fields } })
  payload.logger.info('form: added "Investor"')
}

// 4. Home page in the website's words, if it still has the first seeded hero
type Node = { type: string; version: number; [k: string]: unknown }
const text = (t: string, format = 0): Node => ({
  type: 'text', text: t, format, detail: 0, mode: 'normal', style: '', version: 1,
})
const ITALIC = 2
const el = (type: 'paragraph' | 'heading', children: Node[], tag?: string): Node => ({
  type, ...(tag ? { tag } : { textFormat: 0 }), children, direction: 'ltr', format: '', indent: 0, version: 1,
})
const rich = (...children: Node[]) => ({
  root: { type: 'root', children, direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 },
})

const home = (
  await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, limit: 1, depth: 0 })
).docs[0]
const heroText = JSON.stringify(home?.hero?.richText ?? '')
const BR: Node = { type: 'linebreak', version: 1 }
if (
  home &&
  (heroText.includes('Go-to-market for B2B AI founders before product-market fit') ||
    heroText.includes('More revenue. Less noise. '))
) {
  const column = (kicker: string, heading: string, body: string) => ({
    size: 'oneThird' as const,
    richText: rich(el('heading', [text(kicker)], 'h6'), el('heading', [text(heading)], 'h3'), el('paragraph', [text(body)])),
  })
  await payload.update({
    collection: 'pages',
    id: home.id,
    context: ctx,
    data: {
      hero: {
        type: 'lowImpact',
        richText: rich(
          el('heading', [text('§ 00 · Go-to-market · DACH')], 'h6'),
          el(
            'heading',
            [text('More revenue.'), BR, text('Less noise.'), BR, text('Go-to-market for B2B founders.', ITALIC)],
            'h1',
          ),
          el('paragraph', [
            text(
              'We build go-to-market for B2B founders in DACH – with the right people at the table: partners, investors, decision-makers. Hands-on in day-to-day business, not on slides.',
            ),
          ]),
        ),
      },
      layout: [
        {
          blockType: 'content',
          columns: [
            column(
              '§ 01 · Go-to-market',
              'Positioning and a funnel that scales',
              'ICP, messaging and a sales funnel that scales: outbound, inbound, CRM, forecast – and the first sales hires when the time comes.',
            ),
            column(
              '§ 02 · Partners',
              'Partner channels',
              'Which partners fit your product, who first, and how activation works. Intros and co-selling instead of cold lists.',
            ),
            column(
              '§ 03 · Vouched',
              'The right people, regularly at one table',
              'Founders, decision-makers, partners and investors in small, recurring formats in Munich. Never a sales event.',
            ),
          ],
        },
        {
          blockType: 'cta',
          richText: rich(
            el('heading', [text('Events build trust. '), text('Working together adds depth.', ITALIC)], 'h3'),
            el('paragraph', [
              text('Join Vouched, book a session, or apply for a seat. Larger go-to-market builds: price on request.'),
            ]),
          ),
          links: [
            { link: { type: 'custom', url: '/shop', label: 'See the offers', appearance: 'default' } },
            { link: { type: 'custom', url: '/events', label: 'Upcoming events', appearance: 'outline' } },
          ],
        },
      ],
    },
  })
  payload.logger.info('home: updated to the website wording')
} else {
  payload.logger.info('home: kept (edited in the admin panel)')
}

process.exit(0)
