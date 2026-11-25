import configPromise from '@payload-config'
import type { Form } from '@payloadcms/plugin-form-builder/types'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import React from 'react'

import { FormBlock } from '@/blocks/Form/Component'
import { PageIntro } from '@/components/PageIntro'

export const dynamic = 'force-dynamic'

// Decision-makers and partners never pay; they apply here. Submissions land
// in the form-submissions collection, which only an admin can read.
export default async function ApplyPage() {
  const payload = await getPayload({ config: configPromise })
  const copy = await payload.findGlobal({ slug: 'events-page', depth: 1 })
  const form =
    copy.applicationForm && typeof copy.applicationForm === 'object'
      ? (copy.applicationForm as unknown as Form)
      : null

  return (
    <div className="brand-glow">
      <div className="container pt-20 pb-24">
        <PageIntro kicker={copy.applyKicker} heading={copy.applyHeading} intro={copy.applyIntro} />
        {form && <FormBlock className="max-w-3xl" enableIntro={false} form={form} />}
      </div>
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config: configPromise })
  const copy = await payload.findGlobal({ slug: 'events-page' })
  return { title: copy.applyHeading.replaceAll('*', '') }
}
