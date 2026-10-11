# Bharat Hindu Samaj website

The new website for Bharat Hindu Samaj, Peterborough (registered charity 274404), built to the *Functional Specification: Charity Website* (October 2026).

**Stack:** Next.js 16 (App Router) · Payload CMS 3 (admin, roles, drafts, versions, audit) · SQLite locally / Supabase PostgreSQL in production · Tailwind CSS 4 · Stripe Checkout (cards, Apple Pay, Google Pay) · GoCardless (Direct Debit) · Google Calendar API · Vitest + Playwright + axe.

## Run it locally

```bash
npm install
npm run setup     # creates .env test accounts (git-ignored)
npm run reset     # fresh database with the migrated content
npm run dev       # http://localhost:3000
```

Test account emails and passwords are in `.env` (`SEED_*`). Staff sign in at **/staff/login**; the administrator is asked to set up two-factor sign-in with an authenticator app on first sign-in (required by the spec). The member test account signs in at **/account/login**.

Without payment keys, a **demo checkout** stands in for Stripe/GoCardless so every journey can be tested. It only works in development (or with `ALLOW_DEMO_PAYMENTS=true`). Without SMTP, every email the site would send is captured in **CMS → Admin → Email outbox**.

## Tests

```bash
npm run typecheck
npm run test:unit   # business rules: Gift Aid, HMRC export, bookings, refunds, membership, iCal, member import
npm run test:int    # Payload against a throwaway database: access control, approval workflow, 2FA, fulfilment, double booking
npm run test:e2e    # Playwright journeys (donate, join, book, contact) + axe WCAG 2.2 AA scans
```

CI (`.github/workflows/ci.yml`) runs all of them on every push and pull request.

## Where things are

| Spec area | Where |
|---|---|
| Home page journey (§4, FR-01–05) | `src/app/(frontend)/page.tsx`, `src/components/home/` |
| Times on every page (FR-02) | CMS → Settings → Site settings & times; `src/components/layout/SiteHeader.tsx` |
| Donations, Gift Aid, HMRC export (§6, FR-18–26) | `src/app/(frontend)/donate/`, `src/lib/giftaid.ts`, `/exports/gift-aid` |
| Membership, login, magic link (§7, FR-27–31) | `src/app/(frontend)/membership/`, `account/`, `src/collections/Members.ts` |
| Member Excel import (FR-31) | `/staff/import`, `src/lib/memberImport.ts` |
| Bookings and service catalogue (FR-33–37) | `src/app/(frontend)/book/`, `src/lib/bookingService.ts`, CMS → Bookings |
| Events, calendar, iCal feed (FR-11–17) | `src/app/(frontend)/events/`, `calendar/`, `calendar.ics`, `src/lib/calendar.ts` |
| CMS, roles, approval, audit (§8, FR-41–45) | `src/collections/`, `src/access/roles.ts`, `src/hooks/` |
| Reports and CSV (FR-46) | `/staff/reports`, `src/app/(frontend)/exports/` |
| Roles and approval (section 15) | `src/access/roles.ts`, `src/hooks/approval.ts`, CMS → Admin → Changes awaiting approval / Approval settings |
| Database safeguards (section 16) | `src/migrations/`, `scripts/db-check.mjs` |
| Visual identity (section 17) | `src/app/(frontend)/styles.css` (tokens), `JaaliBand`/`Diya` in `src/components/ui.tsx` |
| Security (NFR-03) | `next.config.ts` (CSP, HSTS), `src/lib/formGuard.ts`, `src/lib/rateLimit.ts` |

## Database (spec section 16): Supabase PostgreSQL

The production database is the Supabase project `ojbykacvgvibefnyqgyl`. The schema is created and changed only by the committed migrations in `src/migrations` (never pushed automatically):

1. In Supabase → **Project settings → Database → Connection string**, copy the **Session pooler** string (port 5432) and put it in `.env` as `DATABASE_URL=…` (replace `[YOUR-PASSWORD]`). Never commit it.
2. `npm run db:migrate` — creates the tables, then enables row-level security on every table and removes Supabase's `anon`/`authenticated` data-API privileges.
3. `npm run db:check` — confirms RLS is on everywhere and the data API has no table access.
4. `npm run setup && npm run seed` — loads the migrated content (only on an empty database).
5. **Uploads:** create a private bucket `media` in Supabase Storage, create S3 access keys (Project settings → Storage), and set `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`.

After any schema change: `npm run db:migration -- <name>`, commit the new file, and `npm run db:migrate` on deploy. CI runs every migration and the seed against a real PostgreSQL 16 on each push.

Members' rows are isolated by the website's access rules (tested); RLS with no public policies means nothing is reachable through Supabase's auto-generated API. The administrator opens the data in Supabase's table editor with their own named account (turn on MFA in Supabase → Account → Security).

## Going live

1. **Secrets** (in the host's environment settings, never in code): `PAYLOAD_SECRET`, `APP_SIGNING_SECRET`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL=https://bharathindusamaj.co.uk`.
2. **Stripe:** `STRIPE_SECRET_KEY`, and a webhook to `https://…/webhooks/stripe` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `invoice.paid` → `STRIPE_WEBHOOK_SECRET`. Test every journey in test mode first.
3. **GoCardless:** `GOCARDLESS_ACCESS_TOKEN`, `GOCARDLESS_ENVIRONMENT=live`, webhook to `https://…/webhooks/gocardless` → `GOCARDLESS_WEBHOOK_SECRET`.
4. **Google Calendar:** create a service account, share the master calendar with it ("Make changes to events"), and set `GOOGLE_CALENDAR_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_KEY`.
5. **Email:** `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, and the `INBOX_*` routing addresses.
6. **Daily job:** schedule `GET /cron/daily` with `Authorization: Bearer $CRON_SECRET` (renewal reminders, lapsing, emptying the 30-day bin).
7. **Monitoring:** point an uptime monitor at `/healthz`. Enable automatic database backups.
8. **Domain (FR-48):** point bharathindusamaj.co.uk at the host once the trustees approve.

See `docs/HANDOVER.md` for the runbook and the decisions still needed from the trustees.
