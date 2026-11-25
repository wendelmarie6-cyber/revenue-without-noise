import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  /** The site name from the "Site settings" global. */
  name: string
}

/** The RWN mark next to the site name in the serif, as on revenuewithoutnoise.com. */
export const Logo = ({ className, name }: Props) => (
  <span className={clsx('flex items-center gap-3 whitespace-nowrap', className)}>
    {/* eslint-disable-next-line @next/next/no-img-element -- small static brand mark */}
    <img src="/brand/logo-rwn.png" alt="" width={32} height={32} className="size-8 rounded-full" />
    <span className="font-serif text-lg tracking-tight">{name}</span>
  </span>
)
