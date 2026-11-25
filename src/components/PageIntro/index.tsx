import React from 'react'

import { Emphasis } from '@/components/Emphasis'

/** The top of a page in the website's style: kicker line, serif heading, intro. */
export const PageIntro: React.FC<{
  kicker?: string | null
  heading: string
  intro?: string | null
  children?: React.ReactNode
}> = ({ kicker, heading, intro, children }) => (
  <div className="max-w-3xl mb-14">
    {kicker && <p className="kicker mb-6">{kicker}</p>}
    <h1 className="text-[2.75rem] leading-[1.05] md:text-7xl md:leading-[1.02]">
      <Emphasis text={heading} />
    </h1>
    {intro && <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{intro}</p>}
    {children}
  </div>
)
