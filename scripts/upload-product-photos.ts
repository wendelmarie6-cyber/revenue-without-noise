// Uploads one photo per product (scripts/product-photos/<slug>.png) into the
// media collection and links it to the product, as an owner would do in the
// admin panel. Products that already have a photo are left alone, unless
// REPLACE_PHOTOS=1 is set: then the new photo is linked and the old one deleted.
// Run against production with NODE_ENV=production, so Payload does not align
// the database schema with the code on start:
//   NODE_ENV=production DATABASE_POOL_MAX=2 npx payload run scripts/upload-product-photos.ts
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

const replace = process.env.REPLACE_PHOTOS === '1'
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'product-photos')
const payload = await getPayload({ config })
const { docs } = await payload.find({ collection: 'products', limit: 50, depth: 0, draft: true })

for (const product of docs) {
  const oldPhoto = typeof product.photo === 'object' ? product.photo?.id : product.photo
  if (oldPhoto && !replace) {
    payload.logger.info(`kept ${product.slug} (has a photo)`)
    continue
  }
  const media = await payload.create({
    collection: 'media',
    data: { alt: product.name },
    filePath: path.join(dir, `${product.slug}.png`),
  })
  await payload.update({ collection: 'products', id: product.id, data: { photo: media.id } })
  if (oldPhoto) await payload.delete({ collection: 'media', id: oldPhoto })
  payload.logger.info(`${oldPhoto ? 'replaced' : 'added'} photo of ${product.slug}`)
}

process.exit(0)
