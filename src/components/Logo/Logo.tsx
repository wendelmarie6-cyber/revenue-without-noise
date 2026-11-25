import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  /** The site name from the "Site settings" global. */
  name: string
}

/** Text wordmark until the brand logo arrives with the design. */
export const Logo = ({ className, name }: Props) => (
  <span className={clsx('text-lg font-semibold tracking-tight whitespace-nowrap', className)}>
    {name}
  </span>
)
