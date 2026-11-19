import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'

// Vouched Tables, Bootcamps and Stammtische. Decision-makers and partners
// never pay; they apply. Only a paid format (such as the bootcamp) links a
// product, and only then does the event page show a buy button.
export const Events: CollectionConfig = {
  slug: 'events',
  // Same rule as Products: anyone sees a published event, only an admin changes one.
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'format', 'date', '_status', 'updatedAt'],
  },
  versions: {
    drafts: true,
  },
  defaultSort: 'date',
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'format',
      type: 'select',
      required: true,
      defaultValue: 'table',
      options: [
        { label: 'Table', value: 'table' },
        { label: 'Bootcamp', value: 'bootcamp' },
        { label: 'Stammtisch', value: 'stammtisch' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime', timeFormat: 'HH:mm' },
      },
    },
    {
      name: 'seats',
      type: 'number',
      min: 1,
      admin: { position: 'sidebar' },
    },
    {
      name: 'location',
      type: 'text',
      required: true,
      admin: { description: 'City and venue, as shown to visitors.' },
    },
    { name: 'summary', type: 'textarea', admin: { description: 'One or two sentences on what happens.' } },
    {
      name: 'audience',
      type: 'textarea',
      required: true,
      admin: { description: 'Who sits at this table.' },
    },
    {
      name: 'host',
      type: 'text',
      admin: { description: 'Who hosts. A role, unless the person has approved being named.' },
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      admin: {
        position: 'sidebar',
        description:
          'Only for paid formats such as the bootcamp. When set, the event page shows a buy button.',
      },
    },
  ],
  timestamps: true,
}
