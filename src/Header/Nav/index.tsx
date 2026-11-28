'use client'

import { usePathname } from 'next/navigation'
import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink, cmsLinkHref } from '@/components/Link'
import { cn } from '@/utilities/ui'
import { isActivePath } from '@/utilities/isActivePath'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const cta = data?.cta
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap items-center gap-x-7 gap-y-3 text-sm">
      {navItems.map(({ link }, i) => {
        // The tab of the page you are on is white with a green line under it.
        const current = isActivePath(pathname, cmsLinkHref(link))
        return (
          <CMSLink
            key={i}
            {...link}
            current={current}
            className={cn(
              'transition-colors hover:text-foreground',
              current
                ? 'text-foreground underline decoration-primary decoration-2 underline-offset-8'
                : 'text-muted-foreground',
            )}
          />
        )
      })}
      {cta?.url && cta.label ? (
        <a
          href={cta.url}
          className="border border-input px-4 py-2 transition-colors hover:border-primary hover:text-primary"
        >
          {cta.label}
        </a>
      ) : null}
    </nav>
  )
}
