import { describe, expect, it } from 'vitest'
import { dayNameOf, decideCapacity, decideRefund, isSlotFree, priceFor, ukDateTime } from '@/lib/booking'
import { isAdult, membershipStatus, nextExpiry, reminderDue, formatMembershipNumber } from '@/lib/membership'
import { resolveTimes, DEFAULT_TIMES } from '@/lib/openingTimes'
import { rateLimit, resetRateLimits } from '@/lib/rateLimit'
import { isReference, makeReference } from '@/lib/reference'

describe('capacity and waiting list', () => {
  it('books when there is room', () => {
    expect(decideCapacity({ capacity: 10, placesTaken: 7, requested: 3, waitlistEnabled: true })).toEqual({ outcome: 'book', remainingAfter: 0 })
  })
  it('waitlists or refuses when full', () => {
    expect(decideCapacity({ capacity: 10, placesTaken: 9, requested: 2, waitlistEnabled: true }).outcome).toBe('waitlist')
    expect(decideCapacity({ capacity: 10, placesTaken: 10, requested: 1, waitlistEnabled: false }).outcome).toBe('full')
  })
  it('treats empty capacity as unlimited and rejects bad quantities', () => {
    expect(decideCapacity({ capacity: null, placesTaken: 999, requested: 2, waitlistEnabled: false }).outcome).toBe('book')
    expect(decideCapacity({ capacity: 10, placesTaken: 0, requested: 0, waitlistEnabled: false }).outcome).toBe('invalid')
    expect(decideCapacity({ capacity: 100, placesTaken: 0, requested: 21, waitlistEnabled: false }).outcome).toBe('invalid')
  })
  it('prices members and guests', () => {
    expect(priceFor({ isMember: true, memberPrice: 7500, guestPrice: 10000, quantity: 1, extrasPence: 7500 })).toBe(15000)
    expect(priceFor({ isMember: false, memberPrice: 500, guestPrice: 800, quantity: 3 })).toBe(2400)
  })
})

describe('slots', () => {
  const d = (h: number) => new Date(Date.UTC(2026, 10, 1, h))
  it('detects overlaps but allows back-to-back bookings', () => {
    const busy = [{ start: d(10), end: d(12) }]
    expect(isSlotFree({ start: d(11), end: d(13) }, busy)).toBe(false)
    expect(isSlotFree({ start: d(12), end: d(14) }, busy)).toBe(true)
    expect(isSlotFree({ start: d(8), end: d(10) }, busy)).toBe(true)
    expect(isSlotFree({ start: d(14), end: d(13) }, busy)).toBe(false)
  })
  it('converts UK local time across BST and GMT', () => {
    expect(ukDateTime('2026-07-01', '10:00').toISOString()).toBe('2026-07-01T09:00:00.000Z')
    expect(ukDateTime('2026-12-01', '10:00').toISOString()).toBe('2026-12-01T10:00:00.000Z')
    expect(dayNameOf('2026-10-10')).toBe('saturday')
  })
})

describe('refunds', () => {
  const rule = { fullRefundHours: 72, lateRefundPercent: 50, depositRefundable: false }
  const startsAt = new Date('2026-11-10T10:00:00Z')
  it('gives a full refund less deposit when early', () => {
    expect(decideRefund({ rule, amountPaid: 20000, depositPaid: 5000, startsAt, now: new Date('2026-11-01T10:00:00Z') }).refund).toBe(15000)
  })
  it('gives a partial refund when late', () => {
    expect(decideRefund({ rule, amountPaid: 20000, depositPaid: 5000, startsAt, now: new Date('2026-11-09T10:00:00Z') }).refund).toBe(7500)
  })
  it('refuses after the start', () => {
    expect(decideRefund({ rule, amountPaid: 20000, depositPaid: 0, startsAt, now: startsAt }).canCancel).toBe(false)
  })
})

describe('membership', () => {
  it('checks over-18 on the exact birthday', () => {
    expect(isAdult(new Date('2008-10-10'), new Date('2026-10-10'))).toBe(true)
    expect(isAdult(new Date('2008-10-11'), new Date('2026-10-10'))).toBe(false)
  })
  it('extends from current expiry when renewing early', () => {
    expect(nextExpiry(new Date('2026-10-10'), new Date('2026-12-01')).toISOString().slice(0, 10)).toBe('2027-12-01')
    expect(nextExpiry(new Date('2026-10-10'), new Date('2026-01-01')).toISOString().slice(0, 10)).toBe('2027-10-10')
  })
  it('works out status and reminders', () => {
    const now = new Date('2026-10-10')
    expect(membershipStatus(new Date('2027-05-01'), now)).toBe('active')
    expect(membershipStatus(new Date('2026-10-20'), now)).toBe('due-soon')
    expect(membershipStatus(new Date('2026-09-20'), now)).toBe('grace')
    expect(membershipStatus(new Date('2026-01-01'), now)).toBe('lapsed')
    expect(membershipStatus(null, now)).toBe('pending-payment')
    expect(reminderDue(new Date('2026-11-05'), now, [])).toBe(30)
    expect(reminderDue(new Date('2026-11-05'), now, [30])).toBeNull()
    expect(reminderDue(new Date('2026-10-15'), now, [30])).toBe(7)
  })
  it('formats membership numbers', () => {
    expect(formatMembershipNumber(42)).toBe('BHS00042')
  })
})

describe('opening times', () => {
  it('applies a seasonal override inside its dates only', () => {
    const input = { standard: DEFAULT_TIMES, overrides: [{ label: 'Navratri', startDate: '2026-10-11', endDate: '2026-10-19', weekdays: '9am–10pm' }] }
    expect(resolveTimes(input, new Date('2026-10-12T12:00:00Z')).weekdays).toBe('9am–10pm')
    expect(resolveTimes(input, new Date('2026-10-12T12:00:00Z')).aarti).toBe(DEFAULT_TIMES.aarti)
    expect(resolveTimes(input, new Date('2026-10-20T12:00:00Z')).overrideLabel).toBeNull()
  })
})

describe('rate limit and references', () => {
  it('blocks after the limit within the window', () => {
    resetRateLimits()
    const now = 1_000_000
    for (let i = 0; i < 3; i++) expect(rateLimit('k', 3, 1000, now).ok).toBe(true)
    expect(rateLimit('k', 3, 1000, now).ok).toBe(false)
    expect(rateLimit('k', 3, 1000, now + 1001).ok).toBe(true)
  })
  it('makes unambiguous references', () => {
    const r = makeReference('D')
    expect(isReference(r)).toBe(true)
    expect(r.slice(6)).not.toMatch(/[01OIL]/)
  })
})
