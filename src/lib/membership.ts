/** Membership rules (spec section 7, FR-27, FR-30). Single tier: £20 a year per person aged 18 or over. */

export const MEMBERSHIP_FEE_PENCE = 2000
export const RENEWAL_REMINDER_DAYS = [30, 7, 0] as const
export const LAPSE_GRACE_DAYS = 30

export type MembershipStatus = 'pending-payment' | 'active' | 'due-soon' | 'grace' | 'lapsed'

export function ageOn(dateOfBirth: Date, on: Date): number {
  let age = on.getUTCFullYear() - dateOfBirth.getUTCFullYear()
  const m = on.getUTCMonth() - dateOfBirth.getUTCMonth()
  if (m < 0 || (m === 0 && on.getUTCDate() < dateOfBirth.getUTCDate())) age--
  return age
}

export function isAdult(dateOfBirth: Date, on = new Date()): boolean {
  return ageOn(dateOfBirth, on) >= 18
}

/** Membership runs for 12 months from the payment date; renewing early extends from the current expiry. */
export function nextExpiry(paidAt: Date, currentExpiry?: Date | null): Date {
  const base = currentExpiry && currentExpiry > paidAt ? currentExpiry : paidAt
  const d = new Date(base)
  d.setUTCFullYear(d.getUTCFullYear() + 1)
  return d
}

export function membershipStatus(expiry: Date | null | undefined, now = new Date()): MembershipStatus {
  if (!expiry) return 'pending-payment'
  const days = Math.floor((expiry.getTime() - now.getTime()) / 864e5)
  if (days > 30) return 'active'
  if (days >= 0) return 'due-soon'
  if (days >= -LAPSE_GRACE_DAYS) return 'grace'
  return 'lapsed'
}

/** Which reminder (if any) is due today, given the reminders already sent. */
export function reminderDue(expiry: Date, now: Date, alreadySent: number[]): number | null {
  const days = Math.ceil((expiry.getTime() - now.getTime()) / 864e5)
  for (const r of RENEWAL_REMINDER_DAYS) {
    if (days <= r && !alreadySent.includes(r)) return r
  }
  return null
}

export function formatMembershipNumber(n: number): string {
  return `BHS${String(n).padStart(5, '0')}`
}
