import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import type { Product, Shop } from '@/payload-types'

import { Emphasis } from '@/components/Emphasis'
import { Media } from '@/components/Media'
import { PageIntro } from '@/components/PageIntro'
import { BuyButton, ProductPrice } from '@/components/ProductOffer'
import { TestModeBanner } from '@/components/TestModeBanner'

// Read on every request: a price changed in the admin panel is live at once,
// without a redeploy.
export const dynamic = 'force-dynamic'

const kindLabel = (shop: Shop, kind: Product['kind']) =>
  kind === 'one-off' ? shop.kindLabels?.oneOff : shop.kindLabels?.[kind]

export default async function ShopPage() {
  const payload = await getPayload({ config: configPromise })
  const [shop, products] = await Promise.all([
    payload.findGlobal({ slug: 'shop' }),
    payload.find({
      collection: 'products',
      overrideAccess: false,
      depth: 1,
      limit: 50,
      sort: 'price',
    }),
  ])
  const custom = shop.custom

  return (
    <>
      <TestModeBanner text={shop.testModeNotice} />
      <div className="brand-glow">
        <div className="container pt-20 pb-24">
          <PageIntro kicker={shop.kicker} heading={shop.heading} intro={shop.intro} />

          <ul className="grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3">
            {products.docs.map((product, i) => (
              <li key={product.id} className="flex flex-col border-r border-b border-border">
                {product.photo && typeof product.photo === 'object' ? (
                  <Media
                    resource={product.photo}
                    imgClassName="w-full aspect-[16/10] object-cover"
                  />
                ) : null}
                <div className="flex flex-1 flex-col gap-4 p-7">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    <span className="text-primary">{String(i + 1).padStart(2, '0')}</span>
                    {kindLabel(shop, product.kind) ? ` · ${kindLabel(shop, product.kind)}` : ''}
                  </p>
                  <h2 className="text-2xl leading-tight">{product.name}</h2>
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                  <ProductPrice product={product} labels={shop} />
                  <BuyButton product={product} labels={shop} />
                </div>
              </li>
            ))}
          </ul>

          {custom?.heading && (
            <section className="mt-16 flex flex-col gap-6 border border-border p-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-3xl leading-tight">
                  <Emphasis text={custom.heading} />
                </h2>
                {custom.text && <p className="mt-3 text-muted-foreground">{custom.text}</p>}
              </div>
              {custom.linkUrl && custom.linkLabel && (
                <Link
                  href={custom.linkUrl}
                  className="shrink-0 border border-input px-5 py-3 text-sm transition-colors hover:border-primary hover:text-primary"
                >
                  {custom.linkLabel} →
                </Link>
              )}
            </section>
          )}
        </div>
      </div>
    </>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config: configPromise })
  const shop = await payload.findGlobal({ slug: 'shop' })
  return { title: shop.heading.replaceAll('*', '') }
}
