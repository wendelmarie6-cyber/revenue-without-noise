import type { Metadata } from 'next'

/**
 * Link-preview defaults. Site name and description come from the "Site
 * settings" global, so callers pass them in; nothing here is template copy.
 */
export const mergeOpenGraph = (
  og: Metadata['openGraph'] = {},
  site?: { siteName: string; description: string },
): Metadata['openGraph'] => ({
  type: 'website',
  ...(site ? { siteName: site.siteName, title: site.siteName, description: site.description } : {}),
  ...og,
})
