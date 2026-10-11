# Handover runbook

## Before launch: items for the trustees and treasurer

These were filled with placeholders or drafts so the site works end to end. Each needs a decision before go-live.

| Item | Where to change | Current state |
|---|---|---|
| Database region and backups | Supabase dashboard | Confirm the project is in a UK/EU region (e.g. London `eu-west-2`); daily backups need the Supabase Pro plan or an alternative — confirm and test a restore (section 16) |
| Treasurer access | CMS → Staff users | Section 15 leaves the treasurer's view "to confirm": currently finance records and booking approvals only |
| Visual identity sign-off | Live site | Section 17 palette, fonts and motifs are a proposed direction — trustees to react on real screens |
| Gift Aid declaration wording | `src/lib/giftaid.ts` (`GIFT_AID_DECLARATION_TEXT`) | HMRC model wording — needs treasurer and administrator approval (FR-20) |
| First HMRC export | `/staff/reports` → HMRC Gift Aid schedule | Treasurer must review the column format before any claim |
| "Why a new Mandir" text | CMS → Settings → New Mandir appeal → Why | Draft written from the spec — replace with the trustees' own words |
| Chairman's video | same tab | Placeholder shown until a YouTube link (with captions) is added |
| Sponsorship amounts | CMS → Fundraising → Sponsorship catalogue | Brick £51, day £251, pillar £5,001, classroom £25,001 are **placeholders** |
| Hall hire prices | CMS → Bookings → Service catalogue | "Price on request" (the current site publishes no hall prices) |
| Bank details | CMS → Settings → Site settings → Bank details | Empty on purpose — the treasurer adds them; shown only inside the donate flow |
| Home page statistics | CMS → Settings → Home page | 1973 / ~1,000 members / 15+ activities / 2 aartis — confirm from records |
| "How funds are held" | CMS → Settings → Trustees, policies & accounts | Draft statement — treasurer to confirm |
| Charity work impact figures | CMS → Content → Pages → Our charity work | Placeholder paragraph awaiting current figures |
| Policies (privacy, safeguarding, hire terms) | CMS → Content → Pages | Drafts for trustee review |
| Concept visuals | CMS → Settings → New Mandir appeal → Vision | A drawn line-art concept is shown; replace with commissioned visuals (always labelled artist's impression) |
| Diwali booking | CMS → Content → Events | Set as free, 300 places, to demonstrate bookings — adjust or turn off |
| Festival texts | CMS → Content → Pages → Hindu festivals | Rewritten in the temple's voice — committee to review |
| Deity images | Media items flagged "Contains deity image" | Priests and committee to approve |

## Roles (spec section 15)

One role per person. Visitors and members use the public site; staff roles are:

- **Administrator** (approver): publishes every change, approves major changes, manages members (view, edit, export, import) and staff, approves bookings; must use two-factor sign-in. Keep a second administrator account (NFR-08).
- **Editor:** drafts events, photos, timings, festivals, news, pages, services **and prices**; ticks "Ready for review"; cannot publish and never sees members' personal details.
- **Treasurer (limited finance view — to confirm with trustees):** donations, Gift Aid, payments, pledges, sponsorships; approves bookings with the administrator; no access to the member list.

Every draft marked "Ready for review" appears in **CMS → Admin → Changes awaiting approval**, flagged *Major* when its type is listed in **Approval settings** (default: home page, appeal, services and prices). Publishing marks the request approved; the administrator can also decline it with a note.

The earlier "membership officer" role is gone: section 15 gives the member list to the administrator only.

A lost authenticator: another administrator unticks "Two-factor sign-in enabled" on the user, who then sets it up again at `/staff/2fa`.

## Everyday operations

- **Approve bookings:** CMS → Bookings → filter Pending approval. For price-on-request items set *Amount* (pence) first, then status *Awaiting payment* — the booker gets a payment link.
- **Record cash/cheque gifts:** CMS → Fundraising → Donations → create, method "Cash / cheque", status Paid; or add the total to *Raised offline* on the appeal.
- **Mark a bank transfer received:** open the donation (status *Awaiting bank transfer*) and set *Paid* with the date.
- **Donor wall:** tick *Approved for display* on donations whose donors consented.
- **Gift Aid claim:** download the HMRC schedule, submit via Charities Online, then fill *Claimed in batch* on those donations so they are not claimed twice.

## Rollback

- Content: every page, event, news post and setting keeps versions — open *Versions* and *Restore*.
- Deleted content sits in the bin (Trash view) for 30 days.
- Code: deploy the previous Git commit from the host dashboard; database migrations are additive.

## Security notes

- Card and bank details never reach our servers (Stripe Checkout and GoCardless hosted pages).
- Secrets live only in environment variables; `.env` is git-ignored.
- Forms: honeypot, signed timestamp, rate limiting; CSRF protected (Next.js server actions and Payload CSRF list).
- Headers: strict CSP, HSTS (production), `X-Frame-Options: DENY`, `nosniff`.
- Rate limiting is in memory per server; with several instances use a shared store (e.g. Upstash Redis).
- Demo checkout is disabled in production unless `ALLOW_DEMO_PAYMENTS=true` — never set that on the live site.
