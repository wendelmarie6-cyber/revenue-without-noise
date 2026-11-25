// Puts the site settings (name, description) and a first home page into the
// CMS, replacing the template's placeholder home page.
// Run with: DATABASE_POOL_MAX=2 npx payload run scripts/seed-site.ts
// Safe to run twice: existing settings and an existing "home" page are left
// alone, so edits made in the admin panel are never overwritten.
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })

type Node = { type: string; version: number; [k: string]: unknown }
const text = (t: string, bold = false): Node => ({
  type: 'text',
  text: t,
  format: bold ? 1 : 0,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})
const block = (type: 'paragraph' | 'heading', children: Node[], tag?: string): Node => ({
  type,
  ...(tag ? { tag } : { textFormat: 0 }),
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})
const p = (t: string) => block('paragraph', [text(t)])
const h = (tag: string, t: string) => block('heading', [text(t)], tag)
const rich = (...children: Node[]) => ({
  root: { type: 'root', children, direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 },
})

// 1. Site settings: an unsaved global only shows its defaults; save them once
// so they live in the database and can be edited.
const site = await payload.findGlobal({ slug: 'site' })
if (site.updatedAt) {
  payload.logger.info('kept site settings (already there)')
} else {
  await payload.updateGlobal({ slug: 'site', data: {}, context: { disableRevalidate: true } })
  payload.logger.info('saved site settings defaults')
}

// 2. Home page
const existing = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'home' } },
  draft: true,
  limit: 1,
})
if (existing.docs.length > 0) {
  payload.logger.info('kept home page (already there)')
} else {
  const column = (heading: string, body: string) => ({
    size: 'oneThird' as const,
    richText: rich(h('h3', heading), p(body)),
  })
  await payload.create({
    collection: 'pages',
    context: { disableRevalidate: true },
    data: {
      title: 'Home',
      slug: 'home',
      generateSlug: false,
      _status: 'published',
      hero: {
        type: 'lowImpact',
        richText: rich(
          h('h1', 'More revenue. Less noise.'),
          p(
            'Go-to-market for B2B AI founders before product-market fit. Hands-on, not on slides.',
          ),
        ),
      },
      layout: [
        {
          blockType: 'content',
          columns: [
            column(
              '§ 01 · Go-to-market',
              'Your ideal customer, your positioning, a funnel that scales, and the first sales hires. Built with you, in your stack.',
            ),
            column(
              '§ 02 · Partners first',
              'Which partner types fit your product, who to approach first, and the first introductions. As a 60-minute session or a two-week sprint.',
            ),
            column(
              '§ 03 · Vouched',
              'Small, recurring tables in Munich where founders, the partners who implement, the decision-makers who buy and investors meet. Never a sales event.',
            ),
          ],
        },
        {
          blockType: 'cta',
          richText: rich(
            h('h3', 'Join Vouched, book a session, or apply for a table.'),
            p('Memberships are monthly. Sessions, seats and the bootcamp are paid once.'),
          ),
          links: [
            { link: { type: 'custom', url: '/shop', label: 'See the offers', appearance: 'default' } },
            { link: { type: 'custom', url: '/events', label: 'Upcoming tables', appearance: 'outline' } },
          ],
        },
      ],
    },
  })
  payload.logger.info('created home page')
}

process.exit(0)
