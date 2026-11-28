import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// The Vercel Blob plugin now always adds its fields (alwaysInsertFields), so
// the schema no longer depends on whether a Blob token is set. Its _objectKey
// column is already live (added by hand on 26 Nov 2026); prefix is new and
// empty. IF NOT EXISTS keeps this safe on a database where push added it.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "prefix" varchar DEFAULT '';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" DROP COLUMN IF EXISTS "prefix";`)
}
