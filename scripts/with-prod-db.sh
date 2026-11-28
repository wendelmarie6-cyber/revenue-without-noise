#!/bin/sh
# Runs one command against the live site's database and media store, and only
# this way. `npm run dev` and plain `npx payload run` use DATABASE_URL from
# .env, which points at the development database, and keep uploads on the
# local disk. This script swaps in PROD_DATABASE_URL and
# PROD_BLOB_READ_WRITE_TOKEN and sets NODE_ENV=production, so Payload never
# changes the live schema on start: schema changes reach the live database
# only as migrations.
#
#   sh scripts/with-prod-db.sh npx payload migrate:status
#   sh scripts/with-prod-db.sh npx payload migrate
#   sh scripts/with-prod-db.sh npx payload run scripts/seed-offering.ts
set -eu
cd "$(dirname "$0")/.."
value() {
  grep "^$1=" .env | cut -d= -f2- | sed -e 's/^["'\'']//' -e 's/["'\'']$//'
}
url=$(value PROD_DATABASE_URL)
if [ -z "$url" ]; then
  echo "PROD_DATABASE_URL is missing in .env" >&2
  exit 1
fi
DATABASE_URL="$url" BLOB_READ_WRITE_TOKEN="$(value PROD_BLOB_READ_WRITE_TOKEN)" \
  NODE_ENV=production DATABASE_POOL_MAX=2 exec "$@"
