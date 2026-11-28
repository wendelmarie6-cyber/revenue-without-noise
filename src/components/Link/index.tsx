import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

import type { Page } from '@/payload-types'

type CMSLinkType = {
  appearance?: 'inline' | ButtonProps['variant']
  children?: React.ReactNode
  className?: string
  /** Marks the link as the page the visitor is on (aria-current="page"). */
  current?: boolean
  label?: string | null
  newTab?: boolean | null
  reference?: {
    relationTo: 'pages'
    value: Page | string | number
  } | null
  size?: ButtonProps['size'] | null
  type?: 'custom' | 'reference' | null
  url?: string | null
}

// Where a CMS link points: a page picked in the admin panel, or a typed URL.
// The header uses the same function to tell which tab is the current page.
export const cmsLinkHref = ({
  type,
  reference,
  url,
}: Pick<CMSLinkType, 'type' | 'reference' | 'url'>): string | null | undefined =>
  type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
    ? `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${
        reference.value.slug
      }`
    : url

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    appearance = 'inline',
    children,
    className,
    current,
    label,
    newTab,
    size: sizeFromProps,
    url,
  } = props

  const href = cmsLinkHref(props)

  if (!href) return null

  const size = appearance === 'link' ? 'clear' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}
  const currentProps = current ? { 'aria-current': 'page' as const } : {}

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'inline') {
    return (
      <Link className={cn(className)} href={href || url || ''} {...newTabProps} {...currentProps}>
        {label && label}
        {children && children}
      </Link>
    )
  }

  return (
    <Button asChild className={className} size={size} variant={appearance}>
      <Link className={cn(className)} href={href || url || ''} {...newTabProps} {...currentProps}>
        {label && label}
        {children && children}
      </Link>
    </Button>
  )
}
