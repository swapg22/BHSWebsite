# Bharat Hindu Samaj website

Next.js 16 + Payload CMS 3. Spec: `../../Functional Specification Charity Website.docx` (FR/NFR IDs are referenced in code comments).

- Payload skill: `.claude/skills/payload/SKILL.md`. Design skill: `../.claude/skills/ui-ux-pro-max`.
- Business rules live in pure functions in `src/lib/` (giftaid, booking, membership, ics, memberImport) with unit tests in `tests/unit`.
- Access control: `src/access/roles.ts`. Always pass `overrideAccess: false` with a `user` when acting for someone.
- Money is integer pence everywhere.
- Before committing: `npm run typecheck && npm test`.

## Skills installed in `.claude/skills` (reviewed before install, licences included)
- `frontend-design` — Anthropic official (Apache-2.0)
- `frontend-design-anchors` — Ilm-Alan/frontend-design (MIT)
- `distinctive-frontend` — Koomook/claude-frontend-skills (MIT)
- `front-a11y`, `front-review`, `front-refactor`, `front-comments` — Effeilo/claude-code-frontend-skills (MIT); read/edit tools only
- `payload` — Payload CMS

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
