<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Documentation check (before every commit)

From the Sprint 3 review: documentation drifted from the code (counts,
limits, file names). Before committing, read the parts of `README.md` and
`CLAUDE.md` that the change touches and check every number, path, command
and rule against the code:

- collections, globals and pages listed in the README exist under those names
- commands and scripts in the README run as written
- environment variables in the README match `.env.example` and the code
- anything "out of scope" in the README is still out of scope

Review reports (from reviewers or AI code review) are saved under
`docs/reviews/` and linked from the README, so they are findable later.
