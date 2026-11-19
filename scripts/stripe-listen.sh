#!/bin/sh
# Forwards Stripe test-mode webhooks to the local dev server.
# Reads the test key from .env so it never appears on the command line.
# Usage: sh scripts/stripe-listen.sh [port]   (default 3001)
set -eu
cd "$(dirname "$0")/.."
PORT="${1:-3001}"
KEY=$(sed -n 's/^STRIPE_SECRET_KEY=//p' .env)
case "$KEY" in
  sk_test_*|rk_test_*) ;;
  *) echo "STRIPE_SECRET_KEY in .env is missing or not a test key" >&2; exit 1 ;;
esac
exec npx stripe listen --api-key "$KEY" \
  --events checkout.session.completed \
  --forward-to "localhost:$PORT/api/stripe/webhook"
