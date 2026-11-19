import type { CollectionConfig, FieldAccess } from 'payload'

import { authenticated } from '../access/authenticated'

// Nobody sets these through the admin panel or the REST API. The checkout
// action and the verified webhook write them through the Local API, which
// is the only path allowed to.
const nobody: FieldAccess = () => false
const writtenByStripeOnly = { create: nobody, update: nobody }

export const Orders: CollectionConfig = {
  slug: 'orders',
  access: {
    // Orders are created by the checkout action on the server, never by a request.
    create: () => false,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'productName',
    defaultColumns: ['productName', 'status', 'amount', 'customerEmail', 'createdAt'],
    description: 'An order counts as paid only when Stripe confirms it through the verified webhook.',
  },
  defaultSort: '-createdAt',
  fields: [
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
      ],
      access: writtenByStripeOnly,
      admin: { position: 'sidebar' },
    },
    { name: 'product', type: 'relationship', relationTo: 'products', required: true },
    {
      name: 'productName',
      type: 'text',
      required: true,
      admin: { description: 'The name at the time of purchase.' },
    },
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: [
        { label: 'Membership', value: 'membership' },
        { label: 'One-off seat', value: 'one-off' },
        { label: 'Service', value: 'service' },
      ],
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      admin: { description: 'Expected amount in cents, taken from the product at checkout.' },
    },
    { name: 'stripeSessionId', type: 'text', index: true, unique: true, access: writtenByStripeOnly },
    { name: 'amountPaid', type: 'number', access: writtenByStripeOnly, admin: { description: 'In cents, as Stripe reported it.' } },
    { name: 'currency', type: 'text', access: writtenByStripeOnly },
    { name: 'customerEmail', type: 'email', access: writtenByStripeOnly },
    { name: 'stripeSubscriptionId', type: 'text', access: writtenByStripeOnly },
    { name: 'paidAt', type: 'date', access: writtenByStripeOnly, admin: { position: 'sidebar' } },
  ],
  timestamps: true,
}
