import type { GlobalConfig } from 'payload'

import { authenticated } from '../access/authenticated'

// Every word on the shop pages lives here, so it can be changed (and later
// translated) in the admin panel instead of in code.
export const Shop: GlobalConfig = {
  slug: 'shop',
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    {
      name: 'kicker',
      type: 'text',
      defaultValue: '§ 01 · Vouched & services',
      admin: { description: 'Small line above the heading, as on revenuewithoutnoise.com.' },
    },
    { name: 'heading', type: 'text', required: true, defaultValue: 'Join Vouched, or *book a session*',
      admin: { description: 'Wrap words in *asterisks* to show them in green italics.' } },
    {
      name: 'intro',
      type: 'textarea',
      defaultValue:
        'Memberships are billed monthly and can be cancelled. Seats and sessions are paid once.',
    },
    {
      name: 'kindLabels',
      type: 'group',
      label: 'Steps: names',
      admin: {
        description:
          'The shop is one path in three steps: meet (one-off seats and days), belong (membership), build (services). The name of each step.',
      },
      fields: [
        { name: 'oneOff', type: 'text', defaultValue: 'Meet the right people' },
        { name: 'membership', type: 'text', defaultValue: 'Belong: Vouched membership' },
        { name: 'service', type: 'text', defaultValue: 'Build it together' },
      ],
    },
    {
      name: 'kindIntros',
      type: 'group',
      label: 'Steps: what each brings',
      admin: { description: 'One or two sentences under each step name.' },
      fields: [
        { name: 'oneOff', type: 'textarea' },
        { name: 'membership', type: 'textarea' },
        { name: 'service', type: 'textarea' },
      ],
    },
    {
      name: 'custom',
      type: 'group',
      label: 'Last step: the full go-to-market build',
      admin: { description: 'The end of the path, below the products: individual work, price on request.' },
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'Something *bigger* in mind?' },
        {
          name: 'text',
          type: 'textarea',
          defaultValue:
            'Go-to-market builds are configured individually, for your stage and your buyers. Price on request.',
        },
        { name: 'linkLabel', type: 'text', defaultValue: 'Book a call' },
        { name: 'linkUrl', type: 'text', defaultValue: 'https://revenuewithoutnoise.com/#kontakt' },
      ],
    },
    {
      name: 'testModeNotice',
      type: 'text',
      required: true,
      defaultValue: 'Test mode – no real payments',
      admin: { description: 'Shown on every page with a buy button while Stripe runs in test mode.' },
    },
    { name: 'buyLabel', type: 'text', required: true, defaultValue: 'Book' },
    { name: 'subscribeLabel', type: 'text', required: true, defaultValue: 'Become a member' },
    { name: 'perMonthLabel', type: 'text', required: true, defaultValue: 'per month' },
    { name: 'paidHeading', type: 'text', required: true, defaultValue: 'Thank you – your payment is confirmed' },
    {
      name: 'paidText',
      type: 'textarea',
      defaultValue: 'Stripe has confirmed the payment. You will hear from us by email.',
    },
    { name: 'pendingHeading', type: 'text', required: true, defaultValue: 'Confirming your payment …' },
    {
      name: 'pendingText',
      type: 'textarea',
      defaultValue:
        'We are waiting for Stripe to confirm the payment. This page updates on its own.',
    },
    { name: 'unknownHeading', type: 'text', required: true, defaultValue: 'We could not find this order' },
    { name: 'backLabel', type: 'text', required: true, defaultValue: 'Back to the shop' },
    { name: 'cancelledHeading', type: 'text', required: true, defaultValue: 'Checkout cancelled' },
    {
      name: 'cancelledText',
      type: 'textarea',
      defaultValue: 'Nothing was charged and nothing was booked. You can start again whenever you like.',
    },
  ],
}
