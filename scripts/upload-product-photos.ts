// Uploads one photo per product (scripts/product-photos/<slug>.png) into the
// media collection and links it to the product, as an owner would do in the
// admin panel. Products that already have a photo are left alone.
// Run with: DATABASE_POOL_MAX=2 npx payload run scripts/upload-product-photos.ts
//
// Needs BLOB_READ_WRITE_TOKEN in .env: the database is shared with the live
// site, so a photo stored only on this computer would be missing on Vercel.
import config from '@payload-config'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error('BLOB_READ_WRITE_TOKEN is not set: photos would not reach the live site.')
}

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'product-photos')
const payload = await getPayload({ config })
const { docs } = await payload.find({ collection: 'products', limit: 50, depth: 0, draft: true })

for (const product of docs) {
  if (product.photo) {
    payload.logger.info(`kept ${product.slug} (has a photo)`)
    continue
  }
  const media = await payload.create({
    collection: 'media',
    data: { alt: product.name },
    filePath: path.join(dir, `${product.slug}.png`),
  })
  await payload.update({ collection: 'products', id: product.id, data: { photo: media.id } })
  payload.logger.info(`added photo to ${product.slug}`)
}

process.exit(0)
