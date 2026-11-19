import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'

// Stripe refuses a euro charge below 50 cents, so the admin panel refuses it first.
const STRIPE_MINIMUM_EUR = 0.5

export const Products: CollectionConfig = {
  slug: 'products',
  // Anyone may look at a published product; only a signed-in admin may change one.
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'kind', 'price', '_status', 'updatedAt'],
  },
  versions: {
    drafts: true,
  },
  defaultSort: 'price',
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField({ useAsSlug: 'name' }),
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'service',
      options: [
        { label: 'Membership (billed monthly)', value: 'membership' },
        { label: 'One-off seat', value: 'one-off' },
        { label: 'Service', value: 'service' },
      ],
      admin: {
        position: 'sidebar',
        description: 'A membership is a monthly subscription; everything else is paid once.',
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: STRIPE_MINIMUM_EUR,
      admin: {
        position: 'sidebar',
        step: 0.01,
        description: 'In euros. For a membership, the price per month.',
      },
    },
    { name: 'description', type: 'textarea', required: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
  ],
  timestamps: true,
}
