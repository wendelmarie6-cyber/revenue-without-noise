import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const [footerData, site] = await Promise.all([
    getCachedGlobal('footer', 1)(),
    getCachedGlobal('site')(),
  ])

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-border">
      <div className="container py-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3">
          <Link href="/">
            <Logo name={site.siteName} />
          </Link>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {site.siteName}
            {footerData?.note ? ` — ${footerData.note}` : ''}
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
          {navItems.map(({ link }, i) => (
            <CMSLink
              className="text-muted-foreground transition-colors hover:text-foreground"
              key={i}
              {...link}
            />
          ))}
        </nav>
      </div>
    </footer>
  )
}
