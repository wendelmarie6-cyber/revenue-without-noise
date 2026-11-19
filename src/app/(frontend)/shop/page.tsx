import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import React from 'react'

import { Media } from '@/components/Media'
import { TestModeBanner } from '@/components/TestModeBanner'
import { startCheckout } from './actions'

// Read on every request: a price changed in the admin panel is live at once,
// without a redeploy.
export const dynamic = 'force-dynamic'

const euros = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' })

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

  return (
    <>
      <TestModeBanner text={shop.testModeNotice} />
      <div className="container pt-16 pb-24">
        <div className="prose dark:prose-invert max-w-none mb-12">
          <h1>{shop.heading}</h1>
          {shop.intro && <p>{shop.intro}</p>}
        </div>

        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.docs.map((product) => {
            const membership = product.kind === 'membership'
            return (
              <li
                key={product.id}
                className="flex flex-col border border-border rounded-lg overflow-hidden bg-card"
              >
                {product.photo && typeof product.photo === 'object' ? (
                  <Media resource={product.photo} imgClassName="w-full h-48 object-cover" />
                ) : null}
                <div className="flex flex-col flex-1 p-6 gap-4">
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <p className="text-2xl font-bold">
                    {euros.format(product.price)}
                    {membership && (
                      <span className="text-base font-normal text-muted-foreground">
                        {' '}
                        {shop.perMonthLabel}
                      </span>
                    )}
                  </p>
                  <p className="flex-1 text-muted-foreground">{product.description}</p>
                  <form action={startCheckout}>
                    <input type="hidden" name="slug" value={product.slug ?? ''} />
                    <button
                      type="submit"
                      className="w-full rounded-md bg-primary text-primary-foreground px-4 py-2 font-medium hover:opacity-90"
                    >
                      {membership ? shop.subscribeLabel : shop.buyLabel}
                    </button>
                  </form>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config: configPromise })
  const shop = await payload.findGlobal({ slug: 'shop' })
  return { title: shop.heading }
}
