'use server'

import { redirect } from 'next/navigation'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { getCurrentMember, getPayloadClient } from '@/lib/data'
import { guardForm, zodErrors, formValues, type FormState } from '@/lib/formGuard'
import { isValidUkPostcode, normalisePostcode, GIFT_AID_DECLARATION_VERSION } from '@/lib/giftaid'
import { MEMBERSHIP_FEE_PENCE } from '@/lib/membership'
import { makeReference } from '@/lib/reference'
import { createCardCheckout } from '@/lib/payments'
import { sendTemplate } from '@/lib/email'
import { sha256 } from '@/lib/signing'
import { siteUrl } from '@/lib/payments'
import { setAuthCookie, clearAuthCookie } from '@/lib/session'
import { rateLimit } from '@/lib/rateLimit'
import { clientIp } from '@/lib/formGuard'

const password = z
  .string()
  .min(10, 'Use at least 10 characters')
  .max(128)
  .refine((p) => /[A-Za-z]/.test(p) && /\d/.test(p), 'Include at least one letter and one number')

const joinSchema = z
  .object({
    firstName: z.string().trim().min(1, 'Enter your first name').max(80),
    lastName: z.string().trim().min(1, 'Enter your last name').max(80),
    email: z.email('Enter a valid email address').max(200),
    phone: z.string().trim().min(6, 'Enter a phone number').max(30),
    addressLine1: z.string().trim().min(3, 'Enter your address').max(120),
    addressLine2: z.string().trim().max(120).optional().or(z.literal('')),
    town: z.string().trim().min(2, 'Enter your town or city').max(80),
    postcode: z.string().trim().refine(isValidUkPostcode, 'Enter a valid UK postcode'),
    password,
    confirmPassword: z.string(),
    over18: z.literal(true, { message: 'Membership is for people aged 18 or over' }),
    privacy: z.literal(true, { message: 'Please agree to the privacy notice' }),
    newsletter: z.boolean(),
    sms: z.boolean(),
    giftAid: z.boolean(),
    autoRenew: z.boolean(),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })

const JOIN_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'addressLine1', 'addressLine2', 'town', 'postcode']

export async function joinMembership(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = formValues(fd, JOIN_FIELDS)
  const guard = await guardForm(fd, 'join', 5)
  if (!guard.ok) return { ok: false, message: guard.error, values }
  const parsed = joinSchema.safeParse({
    ...values,
    password: fd.get('password'),
    confirmPassword: fd.get('confirmPassword'),
    over18: fd.get('over18') === 'on',
    privacy: fd.get('privacy') === 'on',
    newsletter: fd.get('newsletter') === 'on',
    sms: fd.get('sms') === 'on',
    giftAid: fd.get('giftAid') === 'on',
    autoRenew: fd.get('autoRenew') === 'on',
  })
  if (!parsed.success) return { ok: false, message: 'Please check the highlighted fields.', errors: zodErrors(parsed.error.issues), values }
  const d = parsed.data
  const payload = await getPayloadClient()
  const email = d.email.toLowerCase()

  const existing = await payload.find({ collection: 'members', where: { email: { equals: email } }, limit: 1, overrideAccess: true })
  if (existing.docs[0] && existing.docs[0].status !== 'pending-payment') {
    return { ok: false, message: 'There is already a member account with this email. Please sign in to renew, or use "Email me a sign-in link".', values }
  }

  const now = new Date().toISOString()
  const data = {
    email,
    password: d.password,
    firstName: d.firstName,
    lastName: d.lastName,
    phone: d.phone,
    addressLine1: d.addressLine1,
    addressLine2: d.addressLine2 || undefined,
    town: d.town,
    postcode: normalisePostcode(d.postcode),
    status: 'pending-payment' as const,
    over18Confirmed: true,
    autoRenew: d.autoRenew,
    consents: { newsletter: d.newsletter, sms: d.sms },
    giftAid: d.giftAid ? { declared: true, declaredAt: now, declarationVersion: GIFT_AID_DECLARATION_VERSION } : { declared: false },
  }
  const member = existing.docs[0]
    ? await payload.update({ collection: 'members', id: existing.docs[0].id, data, overrideAccess: true })
    : await payload.create({ collection: 'members', data, overrideAccess: true })

  const login = await payload.login({ collection: 'members', data: { email, password: d.password } })
  if (login.token) await setAuthCookie(payload, login.token, login.exp)

  const url = await startMembershipCheckout(member.id, email, `${d.firstName} ${d.lastName}`, d.autoRenew)
  redirect(url)
}

async function startMembershipCheckout(memberId: number, email: string, name: string, autoRenew: boolean): Promise<string> {
  const payload = await getPayloadClient()
  const receiptNumber = makeReference('M')
  await payload.create({
    collection: 'payments',
    data: { receiptNumber, purpose: 'membership', status: 'pending', amount: MEMBERSHIP_FEE_PENCE, member: memberId, payerName: name, payerEmail: email, description: 'Annual membership' },
    overrideAccess: true,
  })
  const checkout = await createCardCheckout({
    purpose: 'membership',
    reference: receiptNumber,
    amountPence: MEMBERSHIP_FEE_PENCE,
    description: 'Bharat Hindu Samaj annual membership',
    customerEmail: email,
    recurring: autoRenew ? 'year' : undefined,
    successPath: `/membership/welcome?ref=${receiptNumber}`,
    cancelPath: '/membership?cancelled=1',
  })
  return checkout.url
}

export async function renewMembership(): Promise<void> {
  const member = await getCurrentMember()
  if (!member) redirect('/account/login?next=/account')
  const url = await startMembershipCheckout(member.id, member.email, `${member.firstName} ${member.lastName ?? ''}`.trim(), Boolean(member.autoRenew))
  redirect(url)
}

const loginSchema = z.object({ email: z.email('Enter a valid email address'), password: z.string().min(1, 'Enter your password') })

function safeNext(next: unknown): string {
  const n = typeof next === 'string' ? next : ''
  return n.startsWith('/') && !n.startsWith('//') && !n.startsWith('/\\') ? n : '/account'
}

export async function loginMember(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = formValues(fd, ['email'])
  const rl = rateLimit(`login:${await clientIp()}`, 10, 15 * 60 * 1000)
  if (!rl.ok) return { ok: false, message: 'Too many sign-in attempts. Please wait a few minutes.', values }
  const parsed = loginSchema.safeParse({ email: fd.get('email'), password: fd.get('password') })
  if (!parsed.success) return { ok: false, message: 'Please check the highlighted fields.', errors: zodErrors(parsed.error.issues), values }
  const payload = await getPayloadClient()
  try {
    const res = await payload.login({ collection: 'members', data: { email: parsed.data.email.toLowerCase(), password: parsed.data.password } })
    if (res.token) await setAuthCookie(payload, res.token, res.exp)
  } catch {
    return { ok: false, message: 'That email and password do not match our records. You can request a sign-in link instead.', values }
  }
  redirect(safeNext(fd.get('next')))
}

export async function requestMagicLink(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = formValues(fd, ['email'])
  const rl = rateLimit(`magic:${await clientIp()}`, 5, 15 * 60 * 1000)
  if (!rl.ok) return { ok: false, message: 'Too many requests. Please wait a few minutes.', values }
  const parsed = z.email().safeParse(String(fd.get('email') ?? '').trim())
  if (!parsed.success) return { ok: false, message: 'Enter a valid email address.', errors: { email: 'Enter a valid email address' }, values }
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'members', where: { email: { equals: parsed.data.toLowerCase() } }, limit: 1, overrideAccess: true })
  const member = docs[0]
  if (member) {
    const token = randomBytes(32).toString('base64url')
    await payload.update({
      collection: 'members',
      id: member.id,
      data: { magicLinkHash: sha256(token), magicLinkExpires: new Date(Date.now() + 15 * 60 * 1000).toISOString() },
      overrideAccess: true,
      context: { skipAudit: true },
    })
    const next = safeNext(fd.get('next'))
    await sendTemplate(payload, {
      to: member.email,
      template: 'magic-link',
      data: { name: member.firstName, url: `${siteUrl()}/account/magic?token=${token}&next=${encodeURIComponent(next)}` },
    })
  }
  // Same response whether or not the email exists, so accounts cannot be discovered
  return { ok: true, message: 'If that email belongs to a member, a sign-in link is on its way. It expires in 15 minutes.' }
}

export async function forgotPassword(_prev: FormState, fd: FormData): Promise<FormState> {
  const rl = rateLimit(`forgot:${await clientIp()}`, 5, 15 * 60 * 1000)
  if (!rl.ok) return { ok: false, message: 'Too many requests. Please wait a few minutes.' }
  const parsed = z.email().safeParse(String(fd.get('email') ?? '').trim())
  if (!parsed.success) return { ok: false, message: 'Enter a valid email address.', errors: { email: 'Enter a valid email address' } }
  const payload = await getPayloadClient()
  try {
    await payload.forgotPassword({ collection: 'members', data: { email: parsed.data.toLowerCase() } })
  } catch {
    // ignore: same response either way
  }
  return { ok: true, message: 'If that email belongs to a member, we have sent a link to reset the password.' }
}

export async function resetPassword(_prev: FormState, fd: FormData): Promise<FormState> {
  const token = String(fd.get('token') ?? '')
  const parsed = z
    .object({ password, confirmPassword: z.string() })
    .refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })
    .safeParse({ password: fd.get('password'), confirmPassword: fd.get('confirmPassword') })
  if (!parsed.success) return { ok: false, message: 'Please check the highlighted fields.', errors: zodErrors(parsed.error.issues) }
  const payload = await getPayloadClient()
  try {
    const res = await payload.resetPassword({ collection: 'members', data: { token, password: parsed.data.password }, overrideAccess: true })
    if (res.token) await setAuthCookie(payload, res.token)
  } catch {
    return { ok: false, message: 'This reset link is invalid or has expired. Please request a new one.' }
  }
  redirect('/account?reset=1')
}

export async function logoutMember(): Promise<void> {
  const payload = await getPayloadClient()
  await clearAuthCookie(payload)
  redirect('/')
}

const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'Enter your first name').max(80),
  lastName: z.string().trim().max(80),
  phone: z.string().trim().max(30),
  addressLine1: z.string().trim().max(120),
  addressLine2: z.string().trim().max(120),
  town: z.string().trim().max(80),
  postcode: z.string().trim().refine((p) => !p || isValidUkPostcode(p), 'Enter a valid UK postcode'),
  newsletter: z.boolean(),
  sms: z.boolean(),
  autoRenew: z.boolean(),
  giftAid: z.boolean(),
})

export async function updateProfile(_prev: FormState, fd: FormData): Promise<FormState> {
  const member = await getCurrentMember()
  if (!member) return { ok: false, message: 'Please sign in again.' }
  const values = formValues(fd, ['firstName', 'lastName', 'phone', 'addressLine1', 'addressLine2', 'town', 'postcode'])
  const parsed = profileSchema.safeParse({
    ...values,
    newsletter: fd.get('newsletter') === 'on',
    sms: fd.get('sms') === 'on',
    autoRenew: fd.get('autoRenew') === 'on',
    giftAid: fd.get('giftAid') === 'on',
  })
  if (!parsed.success) return { ok: false, message: 'Please check the highlighted fields.', errors: zodErrors(parsed.error.issues), values }
  const d = parsed.data
  const payload = await getPayloadClient()
  const giftAidChanged = d.giftAid !== Boolean(member.giftAid?.declared)
  await payload.update({
    collection: 'members',
    id: member.id,
    data: {
      firstName: d.firstName,
      lastName: d.lastName,
      phone: d.phone,
      addressLine1: d.addressLine1,
      addressLine2: d.addressLine2,
      town: d.town,
      postcode: d.postcode ? normalisePostcode(d.postcode) : '',
      autoRenew: d.autoRenew,
      consents: { newsletter: d.newsletter, sms: d.sms },
      ...(giftAidChanged ? { giftAid: d.giftAid ? { declared: true } : { declared: false } } : {}),
    },
    user: member,
    overrideAccess: false,
  })
  if (giftAidChanged) {
    // Declaration date and version are staff-managed fields, so record them with system access
    await payload.update({
      collection: 'members',
      id: member.id,
      data: { giftAid: d.giftAid ? { declared: true, declaredAt: new Date().toISOString(), declarationVersion: GIFT_AID_DECLARATION_VERSION } : { declared: false, declaredAt: null } },
      overrideAccess: true,
    })
  }
  return { ok: true, message: 'Your details have been saved.' }
}

export async function requestDataDeletion(): Promise<FormState> {
  const member = await getCurrentMember()
  if (!member) return { ok: false, message: 'Please sign in again.' }
  const payload = await getPayloadClient()
  await sendTemplate(payload, {
    to: process.env.INBOX_MEMBERSHIP || 'membership@bharathindusamaj.co.uk',
    template: 'contact-routed',
    data: {
      name: `${member.firstName} ${member.lastName ?? ''}`,
      email: member.email,
      topicLabel: 'Data deletion request (UK GDPR)',
      message: `Member ${member.membershipNumber ?? member.id} has asked for their personal data to be deleted. Gift Aid records must be kept for 6 years under HMRC rules; delete or anonymise everything else within one month.`,
    },
  })
  return { ok: true, message: 'Your request has been sent to the membership officer. We will confirm within one month.' }
}
