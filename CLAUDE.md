# Bharat Hindu Samaj website

Next.js 16 + Payload CMS 3. Spec: `../../Functional Specification Charity Website.docx` (FR/NFR IDs are referenced in code comments).

- Payload skill: `.claude/skills/payload/SKILL.md`. Design skill: `../.claude/skills/ui-ux-pro-max`.
- Business rules live in pure functions in `src/lib/` (giftaid, booking, membership, ics, memberImport) with unit tests in `tests/unit`.
- Access control: `src/access/roles.ts`. Always pass `overrideAccess: false` with a `user` when acting for someone.
- Money is integer pence everywhere.
- Before committing: `npm run typecheck && npm test`.
