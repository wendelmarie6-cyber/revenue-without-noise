import type { GlobalConfig } from 'payload'

import { authenticated } from '../access/authenticated'

// Every word on /events, /events/[slug] and /apply lives here, so it can be
// changed (and later translated) in the admin panel instead of in code.
// The buy button and the test-mode notice come from the Shop global, so
// there is one home for them.
export const EventsPage: GlobalConfig = {
  slug: 'events-page',
  label: 'Events & Apply',
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    { name: 'heading', type: 'text', required: true, defaultValue: 'Vouched Tables' },
    {
      name: 'intro',
      type: 'textarea',
      defaultValue:
        'Small, invitation-only rounds in Munich. Founders, the partners who implement, and the decision-makers who buy sit at one table. Never a sales event.',
    },
    { name: 'emptyText', type: 'text', required: true, defaultValue: 'No upcoming events yet.' },
    { name: 'moreLabel', type: 'text', required: true, defaultValue: 'Details' },
    { name: 'backLabel', type: 'text', required: true, defaultValue: 'All events' },
    {
      name: 'labels',
      type: 'group',
      fields: [
        { name: 'date', type: 'text', required: true, defaultValue: 'When' },
        { name: 'location', type: 'text', required: true, defaultValue: 'Where' },
        { name: 'seats', type: 'text', required: true, defaultValue: 'Seats' },
        { name: 'audience', type: 'text', required: true, defaultValue: 'Who sits at the table' },
        { name: 'host', type: 'text', required: true, defaultValue: 'Host' },
      ],
    },
    {
      name: 'formatLabels',
      type: 'group',
      fields: [
        { name: 'table', type: 'text', required: true, defaultValue: 'Table' },
        { name: 'bootcamp', type: 'text', required: true, defaultValue: 'Bootcamp' },
        { name: 'stammtisch', type: 'text', required: true, defaultValue: 'Stammtisch' },
      ],
    },
    {
      name: 'paidNote',
      type: 'textarea',
      defaultValue:
        'Founders book their seat here: they pay for preparation and introductions, never for a seat in front of decision-makers.',
      admin: { description: 'Shown above the buy button on paid events.' },
    },
    { name: 'applyHeading', type: 'text', required: true, defaultValue: 'Apply to Vouched' },
    {
      name: 'applyIntro',
      type: 'textarea',
      defaultValue:
        'Decision-makers and partners never pay; they apply. Tell us who you are and what you want from the table.',
    },
    {
      name: 'applicationForm',
      type: 'relationship',
      relationTo: 'forms',
      admin: {
        description:
          'The form shown on /apply and on every event page. A field named "event" is filled in with the event title.',
      },
    },
  ],
}
