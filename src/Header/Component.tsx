import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

export async function Header() {
  const [headerData, site] = await Promise.all([
    getCachedGlobal('header', 1)(),
    getCachedGlobal('site')(),
  ])

  return <HeaderClient data={headerData} siteName={site.siteName} />
}
