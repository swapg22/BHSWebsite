/** Booking rules (spec section 7, FR-15, FR-17, FR-35, FR-37). Pure functions so they are unit tested. */

export type BookingStatus =
  | 'pending-approval'
  | 'awaiting-payment'
  | 'confirmed'
  | 'waitlisted'
  | 'cancelled'
  | 'refunded'
  | 'rejected'

/** Statuses that hold a place or a time slot. */
export const ACTIVE_STATUSES: BookingStatus[] = ['pending-approval', 'awaiting-payment', 'confirmed']

export interface CapacityInput {
  capacity: number | null | undefined // null/0 = unlimited
  placesTaken: number
  requested: number
  waitlistEnabled: boolean
}

export type CapacityDecision =
  | { outcome: 'book'; remainingAfter: number | null }
  | { outcome: 'waitlist' }
  | { outcome: 'full' }
  | { outcome: 'invalid'; reason: string }

export function decideCapacity({ capacity, placesTaken, requested, waitlistEnabled }: CapacityInput): CapacityDecision {
  if (!Number.isInteger(requested) || requested < 1) return { outcome: 'invalid', reason: 'Choose at least one place' }
  if (requested > 20) return { outcome: 'invalid', reason: 'For more than 20 places please contact the office' }
  if (!capacity || capacity <= 0) return { outcome: 'book', remainingAfter: null }
  const remaining = capacity - placesTaken
  if (requested <= remaining) return { outcome: 'book', remainingAfter: remaining - requested }
  return waitlistEnabled ? { outcome: 'waitlist' } : { outcome: 'full' }
}

export interface PriceInput {
  isMember: boolean
  memberPrice: number // pence
  guestPrice: number // pence
  quantity: number
  extrasPence?: number
}

export function priceFor({ isMember, memberPrice, guestPrice, quantity, extrasPence = 0 }: PriceInput): number {
  const unit = isMember ? memberPrice : guestPrice
  return unit * quantity + extrasPence
}

export interface Interval {
  start: Date
  end: Date
}

export function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end
}

/** A requested slot is free if it overlaps no busy interval from the master calendar or existing bookings. */
export function isSlotFree(requested: Interval, busy: Interval[]): boolean {
  if (!(requested.start < requested.end)) return false
  return !busy.some((b) => overlaps(requested, b))
}

export interface CancellationRule {
  /** Hours before the start when a full refund is still given. */
  fullRefundHours: number
  /** Percentage refunded after that point (0-100). */
  lateRefundPercent: number
  /** Deposits are often non-refundable for hall hire. */
  depositRefundable: boolean
}

export interface RefundInput {
  rule: CancellationRule
  amountPaid: number
  depositPaid: number
  startsAt: Date
  now: Date
}

export interface RefundDecision {
  canCancel: boolean
  refund: number
  reason: string
}

export function decideRefund({ rule, amountPaid, depositPaid, startsAt, now }: RefundInput): RefundDecision {
  if (now >= startsAt) return { canCancel: false, refund: 0, reason: 'This booking has already started' }
  const hoursBefore = (startsAt.getTime() - now.getTime()) / 36e5
  const refundableBase = rule.depositRefundable ? amountPaid : Math.max(0, amountPaid - depositPaid)
  if (hoursBefore >= rule.fullRefundHours) {
    return {
      canCancel: true,
      refund: refundableBase,
      reason: rule.depositRefundable ? 'Full refund' : 'Full refund less the non-refundable deposit',
    }
  }
  const pct = Math.min(100, Math.max(0, rule.lateRefundPercent))
  return {
    canCancel: true,
    refund: Math.floor((refundableBase * pct) / 100),
    reason: pct > 0 ? `Late cancellation: ${pct}% refund` : 'Late cancellation: no refund',
  }
}

/** Combine a YYYY-MM-DD date and HH:MM time in UK local time into a Date. */
export function ukDateTime(date: string, time: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) throw new Error('Invalid date or time')
  // Work out the Europe/London offset for that day, so BST/GMT is handled correctly
  const guess = new Date(`${date}T${time}:00Z`)
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(guess)
  const h = Number(parts.find((p) => p.type === 'hour')?.value)
  const m = Number(parts.find((p) => p.type === 'minute')?.value)
  const [th, tm] = time.split(':').map(Number)
  const offsetMinutes = (h * 60 + m - (th * 60 + tm) + 1440) % 1440
  const normalised = offsetMinutes > 720 ? offsetMinutes - 1440 : offsetMinutes
  return new Date(guess.getTime() - normalised * 60000)
}

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
export type DayName = (typeof DAY_NAMES)[number]

export function dayNameOf(date: string): DayName {
  const [y, m, d] = date.split('-').map(Number)
  return DAY_NAMES[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
}
