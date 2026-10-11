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
