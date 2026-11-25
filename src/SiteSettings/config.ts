import type { GlobalAfterChangeHook, GlobalConfig } from 'payload'
import { revalidateTag } from 'next/cache'

import { authenticated } from '../access/authenticated'

const revalidateSite: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating site settings')
    revalidateTag('global_site', 'max')
  }
  return doc
}

// The site's own name and description, used in the header, footer, page
// titles and link previews. One home for them, editable in the admin panel.
export const SiteSettings: GlobalConfig = {
  slug: 'site',
  label: 'Site settings',
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    { name: 'siteName', type: 'text', required: true, defaultValue: 'Revenue without Noise' },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      defaultValue:
        'Go-to-market for B2B AI founders before product-market fit, and Vouched: small, recurring tables where founders, partners, decision-makers and investors meet.',
      admin: { description: 'Shown in search results and link previews (LinkedIn, Slack, …).' },
    },
  ],
  hooks: {
    afterChange: [revalidateSite],
  },
}
