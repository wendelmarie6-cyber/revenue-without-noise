'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
  siteName: string
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, siteName }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs browser-only state after mount (template code)
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header
      className="relative z-20 border-b border-border"
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="container py-5 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <Link href="/">
          <Logo name={siteName} />
        </Link>
        <HeaderNav data={data} />
      </div>
    </header>
  )
}
