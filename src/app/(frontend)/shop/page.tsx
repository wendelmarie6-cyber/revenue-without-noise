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
const kindIntro = (shop: Shop, kind: Product['kind']) =>
  kind === 'one-off' ? shop.kindIntros?.oneOff : shop.kindIntros?.[kind]

// One path to a go-to-market that runs: meet the right people (one seat,
// one day), belong (membership), build it together (services), and at the
// end the individual build from the box below the products.
const KIND_ORDER: Product['kind'][] = ['one-off', 'membership', 'service']
const stepNumber = (index: number) => String(index + 1).padStart(2, '0')

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

          <ol className="mt-12 grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-4">
            {KIND_ORDER.map((kind, index) => (
              <li key={kind} className="border-r border-b border-border">
                <a
                  href={`#step-${kind}`}
                  className="flex h-full flex-col gap-2 p-5 transition-colors hover:bg-card"
                >
                  <span className="text-xs font-medium tracking-[0.2em] text-primary">
                    {stepNumber(index)}
                  </span>
                  <span className="text-lg leading-snug">{kindLabel(shop, kind)}</span>
                </a>
              </li>
            ))}
            {custom?.heading && (
              <li className="border-r border-b border-border">
                <a
                  href="#step-build"
                  className="flex h-full flex-col gap-2 p-5 transition-colors hover:bg-card"
                >
                  <span className="text-xs font-medium tracking-[0.2em] text-primary">→</span>
                  <span className="text-lg leading-snug">
                    <Emphasis text={custom.heading} />
                  </span>
                </a>
              </li>
            )}
          </ol>

          {KIND_ORDER.map((kind, groupIndex) => {
            const group = products.docs.filter((product) => product.kind === kind)
            if (group.length === 0) return null
            return (
              <section key={kind} id={`step-${kind}`} className="mt-20 scroll-mt-8">
                <p className="mb-3 text-xs font-medium tracking-[0.2em] text-primary">
                  {stepNumber(groupIndex)}
                </p>
                <h2 className="text-3xl leading-tight">{kindLabel(shop, kind)}</h2>
                {kindIntro(shop, kind) && (
                  <p className="mt-3 max-w-2xl text-muted-foreground">{kindIntro(shop, kind)}</p>
                )}
                <div className="mb-6" />
                <ul className="grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3">
                  {group.map((product) => (
                    <li key={product.id} className="flex flex-col border-r border-b border-border">
                      {product.photo && typeof product.photo === 'object' ? (
                        <Media
                          resource={product.photo}
                          imgClassName="w-full aspect-[16/10] object-cover"
                        />
                      ) : null}
                      <div className="flex flex-1 flex-col gap-4 p-7">
                        <h3 className="text-2xl leading-tight">{product.name}</h3>
                        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                          {product.description}
                        </p>
                        <ProductPrice product={product} labels={shop} />
                        <BuyButton product={product} labels={shop} />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}

          {custom?.heading && (
            <section
              id="step-build"
              className="mt-20 flex scroll-mt-8 flex-col gap-6 border border-primary/60 p-8 md:flex-row md:items-center md:justify-between"
            >
              <div className="max-w-2xl">
                <p className="mb-3 text-xs font-medium tracking-[0.2em] text-primary">→</p>
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
