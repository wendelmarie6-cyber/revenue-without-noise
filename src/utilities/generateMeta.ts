import type { Metadata } from 'next'

import type { Media, Page, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'
import { getCachedGlobal } from './getGlobals'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  if (!image || typeof image !== 'object' || !('url' in image)) return undefined
  const serverUrl = getServerSideURL()
  const ogUrl = image.sizes?.og?.url
  return ogUrl ? serverUrl + ogUrl : serverUrl + image.url
}

/** "Page title | Site name", or the site name alone. */
export const pageTitle = (siteName: string, title?: string | null) =>
  title ? `${title} | ${siteName}` : siteName

export const generateMeta = async (args: {
  doc: Partial<Page> | null
}): Promise<Metadata> => {
  const { doc } = args
  const site = await getCachedGlobal('site')()

  const ogImage = getImageURL(doc?.meta?.image)
  const title = pageTitle(site.siteName, doc?.meta?.title)
  const description = doc?.meta?.description || site.description

  return {
    description,
    openGraph: mergeOpenGraph(
      {
        description,
        images: ogImage ? [{ url: ogImage }] : undefined,
        title,
        url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
      },
      site,
    ),
    title,
  }
}
