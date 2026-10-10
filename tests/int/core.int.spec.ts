import { rmSync } from 'fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'
import { generateSecret, generateSync } from 'otplib'
import type { Member, User } from '@/payload-types'

let payload: Payload
let admin: User
let editor: User
let treasurer: User
let memberA: Member
let memberB: Member
const ctx = { skipInvite: true, skipRevalidate: true }

async function staff(email: string, roles: User['roles'], extra: Partial<User> = {}) {
  const u = await payload.create({ collection: 'users', data: { email, password: 'Test-password-123', name: email, roles, ...extra }, overrideAccess: true, context: ctx })
  return { ...u, collection: 'users' } as User & { collection: 'users' }
}

beforeAll(async () => {
  rmSync('data/test.db', { force: true })
  const { default: config } = await import('@/payload.config')
  payload = await getPayload({ config })
  admin = await staff('admin@test.test', ['administrator'], { twoFactorEnabled: true, twoFactorSecret: generateSecret() } as Partial<User>)
  editor = await staff('editor@test.test', ['editor'])
  treasurer = await staff('treasurer@test.test', ['treasurer'])
  memberA = { ...(await payload.create({ collection: 'members', data: { email: 'a@test.test', password: 'Member-pass-123', firstName: 'Asha', status: 'active', expiryDate: new Date(Date.now() + 200 * 864e5).toISOString(), committeeNotes: 'private note' }, overrideAccess: true })), collection: 'members' } as Member
  memberB = { ...(await payload.create({ collection: 'members', data: { email: 'b@test.test', password: 'Member-pass-123', firstName: 'Ravi', status: 'pending-payment' }, overrideAccess: true })), collection: 'members' } as Member
})

describe('approval workflow (FR-43)', () => {
  it('lets an editor save a draft but not publish', async () => {
    const draft = await payload.create({
      collection: 'events',
      data: { title: 'Editor draft', startsAt: new Date(Date.now() + 864e5).toISOString(), endsAt: new Date(Date.now() + 2 * 864e5).toISOString(), category: 'festival', _status: 'draft' },
      user: editor,
      overrideAccess: false,
      draft: true,
      context: ctx,
    })
    expect(draft.id).toBeDefined()
    await expect(
      payload.update({ collection: 'events', id: draft.id, data: { _status: 'published' }, user: editor, overrideAccess: false, context: ctx }),
    ).rejects.toThrow(/approver/i)
    const published = await payload.update({ collection: 'events', id: draft.id, data: { _status: 'published' }, user: admin, overrideAccess: false, context: ctx })
    expect(published._status).toBe('published')
  })

  it('hides drafts from the public', async () => {
    await payload.create({ collection: 'news', data: { title: 'Secret draft', body: { root: { type: 'root', children: [], direction: 'ltr', format: '', indent: 0, version: 1 } }, _status: 'draft' }, overrideAccess: true, draft: true, context: ctx })
    const pub = await payload.find({ collection: 'news', where: { title: { equals: 'Secret draft' } }, overrideAccess: false })
    expect(pub.docs).toHaveLength(0)
  })

  it('writes an audit log entry for each change (FR-45)', async () => {
    const log = await payload.find({ collection: 'audit-log', where: { action: { equals: 'publish' } }, overrideAccess: true })
    expect(log.docs.some((l) => l.actorEmail === 'admin@test.test' && l.entity === 'events')).toBe(true)
  })
})

describe('role-based access (FR-41)', () => {
  it('only finance roles can read donations', async () => {
    await payload.create({ collection: 'donations', data: { status: 'pending', reference: 'BHS-D-AAAAAA', amount: 1000, method: 'card', fund: 'new-mandir', firstName: 'X', lastName: 'Y', email: 'x@test.test', frequency: 'one-off', source: 'personal' }, overrideAccess: true })
    const asTreasurer = await payload.find({ collection: 'donations', user: treasurer, overrideAccess: false })
    expect(asTreasurer.totalDocs).toBeGreaterThan(0)
    const asEditor = payload.find({ collection: 'donations', user: editor, overrideAccess: false })
    await expect(asEditor).rejects.toThrow()
  })

  it('members see only their own record, never committee notes', async () => {
    const own = await payload.find({ collection: 'members', user: memberA, overrideAccess: false })
    expect(own.docs.map((m) => m.email)).toEqual(['a@test.test'])
    expect(own.docs[0].committeeNotes).toBeUndefined()
    const asAdmin = await payload.findByID({ collection: 'members', id: memberA.id, user: admin, overrideAccess: false })
    expect(asAdmin.committeeNotes).toBe('private note')
  })

  it('members cannot change their own membership status', async () => {
    const updated = await payload.update({ collection: 'members', id: memberB.id, data: { status: 'active', firstName: 'Ravi K' }, user: memberB, overrideAccess: false })
    expect(updated.firstName).toBe('Ravi K')
    expect(updated.status).toBe('pending-payment')
  })

  it('editors cannot change service prices', async () => {
    const svc = await payload.create({ collection: 'services', data: { availability: 'active', name: 'Test pooja', category: 'pooja', memberPrice: 5100, nonMemberPrice: 7500 }, overrideAccess: true })
    await expect(payload.update({ collection: 'services', id: svc.id, data: { memberPrice: 1 }, user: editor, overrideAccess: false })).rejects.toThrow(/treasurer/i)
    const ok = await payload.update({ collection: 'services', id: svc.id, data: { summary: 'Updated words' }, user: editor, overrideAccess: false })
    expect(ok.summary).toBe('Updated words')
  })
})

describe('two-factor sign-in for administrators (FR-42)', () => {
  it('rejects an administrator login without a valid code', async () => {
    await expect(payload.login({ collection: 'users', data: { email: 'admin@test.test', password: 'Test-password-123' } })).rejects.toThrow(/two-factor/i)
  })
  it('accepts the current TOTP code', async () => {
    const full = await payload.findByID({ collection: 'users', id: admin.id, overrideAccess: true, showHiddenFields: true })
    const totp = generateSync({ secret: full.twoFactorSecret! })
    const res = await payload.login({ collection: 'users', data: { email: 'admin@test.test', password: 'Test-password-123' }, req: { data: { totp } } as never })
    expect(res.token).toBeTruthy()
  })
  it('blocks suspended users', async () => {
    await payload.update({ collection: 'users', id: treasurer.id, data: { suspended: true }, overrideAccess: true, context: ctx })
    await expect(payload.login({ collection: 'users', data: { email: 'treasurer@test.test', password: 'Test-password-123' } })).rejects.toThrow(/suspended/i)
  })
})

describe('Gift Aid on donations (FR-20)', () => {
  it('marks only declared personal UK gifts with an address as eligible', async () => {
    const base = { status: 'pending' as const, amount: 2500, method: 'card' as const, fund: 'new-mandir' as const, firstName: 'G', lastName: 'A', email: 'g@test.test', frequency: 'one-off' as const }
    const ok = await payload.create({ collection: 'donations', data: { ...base, reference: 'BHS-D-BBBBBB', source: 'personal', houseNameOrNumber: '6', postcode: 'PE1 3BU', giftAid: { declared: true, ukTaxpayer: true } }, overrideAccess: true })
    expect(ok.giftAidEligible).toBe(true)
    const company = await payload.create({ collection: 'donations', data: { ...base, reference: 'BHS-D-CCCCCC', source: 'company', houseNameOrNumber: '6', postcode: 'PE1 3BU', giftAid: { declared: true, ukTaxpayer: true } }, overrideAccess: true })
    expect(company.giftAidEligible).toBe(false)
    const noAddress = await payload.create({ collection: 'donations', data: { ...base, reference: 'BHS-D-DDDDDD', source: 'personal', giftAid: { declared: true, ukTaxpayer: true } }, overrideAccess: true })
    expect(noAddress.giftAidEligible).toBe(false)
  })
})

describe('payments and fulfilment', () => {
  it('activates a membership once, assigning a number and expiry (idempotent)', async () => {
    const { fulfilMembership } = await import('@/lib/fulfilment')
    await payload.create({ collection: 'payments', data: { receiptNumber: 'BHS-M-EEEEEE', purpose: 'membership', amount: 2000, member: memberB.id, status: 'pending' }, overrideAccess: true })
    expect(await fulfilMembership(payload, 'BHS-M-EEEEEE', { provider: 'demo' })).toBe('applied')
    expect(await fulfilMembership(payload, 'BHS-M-EEEEEE', { provider: 'demo' })).toBe('already')
    const m = await payload.findByID({ collection: 'members', id: memberB.id, overrideAccess: true })
    expect(m.status).toBe('active')
    expect(m.membershipNumber).toMatch(/^BHS\d{5}$/)
    expect(new Date(m.expiryDate!).getTime()).toBeGreaterThan(Date.now() + 360 * 864e5)
    const mail = await payload.find({ collection: 'email-outbox', where: { to: { equals: 'b@test.test' } }, overrideAccess: true })
    expect(mail.docs.some((e) => /Welcome/.test(e.subject))).toBe(true)
  })

  it('records a sponsorship and counts it once', async () => {
    const { fulfilDonation } = await import('@/lib/fulfilment')
    const item = await payload.create({ collection: 'sponsorship-items', data: { name: 'Pillar', type: 'pillar', amount: 500100, totalAvailable: 2 }, overrideAccess: true })
    await payload.create({ collection: 'donations', data: { status: 'pending', reference: 'BHS-D-FFFFFF', amount: 500100, method: 'card', fund: 'new-mandir', firstName: 'S', lastName: 'P', email: 's@test.test', frequency: 'one-off', source: 'personal', sponsorship: item.id }, overrideAccess: true })
    await fulfilDonation(payload, 'BHS-D-FFFFFF', { provider: 'demo' })
    await fulfilDonation(payload, 'BHS-D-FFFFFF', { provider: 'demo' })
    const after = await payload.findByID({ collection: 'sponsorship-items', id: item.id, overrideAccess: true })
    expect(after.sponsoredCount).toBe(1)
  })
})

describe('bookings (FR-15, FR-35, FR-37)', () => {
  it('fills capacity, then waitlists, then promotes on cancellation', async () => {
    const { createEventBooking, cancelBooking } = await import('@/lib/bookingService')
    const ev = await payload.create({
      collection: 'events',
      data: { title: 'Small workshop', startsAt: new Date(Date.now() + 10 * 864e5).toISOString(), endsAt: new Date(Date.now() + 10 * 864e5 + 7200e3).toISOString(), category: 'workshop', bookable: true, capacity: 2, waitlist: true, memberPrice: 0, guestPrice: 0, _status: 'published' },
      overrideAccess: true,
      context: ctx,
    })
    const b1 = await createEventBooking(payload, { eventId: ev.id, name: 'One', email: 'one@test.test', quantity: 2 })
    expect(b1.ok && b1.value.booking.status).toBe('confirmed')
    const b2 = await createEventBooking(payload, { eventId: ev.id, name: 'Two', email: 'two@test.test', quantity: 1 })
    expect(b2.ok && b2.value.booking.status).toBe('waitlisted')
    if (!b1.ok || !b2.ok) throw new Error('booking failed')
    const cancelled = await cancelBooking(payload, b1.value.booking)
    expect(cancelled.ok).toBe(true)
    const promoted = await payload.findByID({ collection: 'bookings', id: b2.value.booking.id, overrideAccess: true })
    expect(promoted.status).toBe('confirmed')
  })

  it('prevents double booking of the hall', async () => {
    const { createServiceBooking } = await import('@/lib/bookingService')
    const hall = await payload.create({ collection: 'services', data: { availability: 'active', name: 'Hall', category: 'hall', memberPrice: 0, nonMemberPrice: 0, location: 'main-hall', requiresApproval: true, earliestTime: '09:00', latestTime: '22:00' }, overrideAccess: true })
    const date = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10)
    const first = await createServiceBooking(payload, { serviceId: hall.id, date, startTime: '10:00', durationMinutes: 180, name: 'A', email: 'a1@test.test' })
    expect(first.ok).toBe(true)
    const clash = await createServiceBooking(payload, { serviceId: hall.id, date, startTime: '12:00', durationMinutes: 120, name: 'B', email: 'b1@test.test' })
    expect(clash.ok).toBe(false)
    const after = await createServiceBooking(payload, { serviceId: hall.id, date, startTime: '13:00', durationMinutes: 120, name: 'C', email: 'c1@test.test' })
    expect(after.ok).toBe(true)
  })

  it('applies member prices only to active members', async () => {
    const { createServiceBooking } = await import('@/lib/bookingService')
    const pooja = await payload.create({ collection: 'services', data: { availability: 'active', name: 'Havan test', category: 'pooja', memberPrice: 7500, nonMemberPrice: 10000, location: 'home', requiresApproval: true }, overrideAccess: true })
    const date = new Date(Date.now() + 40 * 864e5).toISOString().slice(0, 10)
    const asMember = await createServiceBooking(payload, { serviceId: pooja.id, date, startTime: '10:00', name: 'A', email: 'a@test.test', member: memberA })
    const asGuest = await createServiceBooking(payload, { serviceId: pooja.id, date, startTime: '10:00', name: 'G', email: 'g2@test.test' })
    expect(asMember.ok && asMember.value.booking.amount).toBe(7500)
    expect(asGuest.ok && asGuest.value.booking.amount).toBe(10000)
  })
})
