// Puts the seven catalogue entries from CLAUDE.md into the Products collection.
// Run with: npx payload run scripts/seed-products.ts
// Safe to run twice: a product whose slug already exists is left alone, so
// edits made in the admin panel are never overwritten.
import config from '@payload-config'
import { getPayload } from 'payload'

type Seed = {
  name: string
  slug: string
  kind: 'membership' | 'one-off' | 'service'
  price: number
  description: string
}

const catalogue: Seed[] = [
  {
    name: 'Vouched Pre-Seed',
    slug: 'vouched-pre-seed',
    kind: 'membership',
    price: 19,
    description:
      'For teams of up to five people with no revenue yet. A seat in the Vouched community: small, invitation-only rounds in Munich where founders, partners, decision-makers and investors meet around AI.',
  },
  {
    name: 'Vouched Seed',
    slug: 'vouched-seed',
    kind: 'membership',
    price: 49,
    description:
      'For teams of up to twenty people. Everything in Pre-Seed, for a company that is already selling and wants partners to carry it further.',
  },
  {
    name: 'Vouched Series A',
    slug: 'vouched-series-a',
    kind: 'membership',
    price: 149,
    description:
      'For teams of up to fifty people. Everything in Seed, for a company building its partner channel in earnest.',
  },
  {
    name: 'Roundtable seat',
    slug: 'roundtable-seat',
    kind: 'one-off',
    price: 39,
    description:
      'One seat at one industry roundtable: a small table, a host, and the people you came to talk to. Never a sales event.',
  },
  {
    name: 'Partner Fit Session',
    slug: 'partner-fit-session',
    kind: 'service',
    price: 190,
    description:
      'Sixty minutes on which partner types fit your product, and which one to approach first.',
  },
  {
    name: 'Partner GTM Sprint',
    slug: 'partner-gtm-sprint',
    kind: 'service',
    price: 1900,
    description:
      'Two weeks: your partner ideal customer profile, a shortlist of partners, and the first introductions.',
  },
  {
    name: 'Partner GTM Bootcamp',
    slug: 'partner-gtm-bootcamp',
    kind: 'one-off',
    price: 590,
    description:
      'One day with twenty founders: your partner ideal customer profile, a top-ten partner shortlist, a 90-day plan, and a peer check at the end.',
  },
]

const payload = await getPayload({ config })

for (const product of catalogue) {
  const existing = await payload.find({
    collection: 'products',
    where: { slug: { equals: product.slug } },
    draft: true,
    limit: 1,
  })
  if (existing.docs.length > 0) {
    payload.logger.info(`kept ${product.slug} (already there)`)
    continue
  }
  await payload.create({
    collection: 'products',
    data: { ...product, generateSlug: false, _status: 'published' },
  })
  payload.logger.info(`created ${product.slug}`)
}

process.exit(0)
