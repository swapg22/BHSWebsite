# Handover runbook

## Before launch: items for the trustees and treasurer

These were filled with placeholders or drafts so the site works end to end. Each needs a decision before go-live.

| Item | Where to change | Current state |
|---|---|---|
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

## Roles

- **Administrator** (approver): publishes, manages users; must use two-factor sign-in. Keep a second administrator account (NFR-08).
- **Editor:** drafts events, news, albums, pages, photos; cannot publish or change prices.
- **Treasurer:** donations, Gift Aid, payments, refunds, service prices, sponsorships, pledges.
- **Membership officer:** members, bookings, registers, import.

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
