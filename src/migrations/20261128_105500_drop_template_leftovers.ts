import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// The live database was first built by schema push from Payload's website
// template. The blog (posts, categories), search and redirects were removed
// later, but push left their empty relation columns and unused enum types
// behind. Checked on 28 Nov 2026: every column below holds no value and no
// column uses the enums. On a database built from the baseline migration they
// never existed, so every statement is IF EXISTS and does nothing there.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_pages_v_rels" DROP COLUMN IF EXISTS "categories_id";
   ALTER TABLE "_pages_v_rels" DROP COLUMN IF EXISTS "posts_id";
   ALTER TABLE "footer_rels" DROP COLUMN IF EXISTS "posts_id";
   ALTER TABLE "header_rels" DROP COLUMN IF EXISTS "posts_id";
   ALTER TABLE "pages_rels" DROP COLUMN IF EXISTS "categories_id";
   ALTER TABLE "pages_rels" DROP COLUMN IF EXISTS "posts_id";
   ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "categories_id";
   ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "posts_id";
   ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "redirects_id";
   ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "search_id";
   DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_archive_populate_by";
   DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_archive_relation_to";
   DROP TYPE IF EXISTS "public"."enum__posts_v_version_status";
   DROP TYPE IF EXISTS "public"."enum_pages_blocks_archive_populate_by";
   DROP TYPE IF EXISTS "public"."enum_pages_blocks_archive_relation_to";
   DROP TYPE IF EXISTS "public"."enum_posts_status";
   DROP TYPE IF EXISTS "public"."enum_redirects_to_type";`)
}

// Nothing to restore: the columns were empty and the code never uses them.
export async function down(_args: MigrateDownArgs): Promise<void> {}
