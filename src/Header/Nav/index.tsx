'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const cta = data?.cta

  return (
    <nav className="flex flex-wrap items-center gap-x-7 gap-y-3 text-sm">
      {navItems.map(({ link }, i) => (
        <CMSLink
          key={i}
          {...link}
          className="text-muted-foreground transition-colors hover:text-foreground"
        />
      ))}
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
