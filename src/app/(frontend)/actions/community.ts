'use server'

import { z } from 'zod'
import { randomBytes } from 'crypto'
import { getPayloadClient } from '@/lib/data'
import { guardForm, zodErrors, formValues, type FormState } from '@/lib/formGuard'
import { sendTemplate } from '@/lib/email'
import { siteUrl } from '@/lib/payments'
import { CONTACT_TOPICS, VOLUNTEER_SKILLS } from '@/collections/Community'

const INBOX: Record<string, string | undefined> = {
  general: process.env.INBOX_GENERAL,
  bookings: process.env.INBOX_BOOKINGS,
  donations: process.env.INBOX_DONATIONS,
  membership: process.env.INBOX_MEMBERSHIP,
  safeguarding: process.env.INBOX_SAFEGUARDING,
}

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(100),
  email: z.email('Please enter a valid email address').max(200),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  topic: z.enum(CONTACT_TOPICS.map((t) => t.value) as [string, ...string[]], { message: 'Choose a topic' }),
  message: z.string().trim().min(10, 'Please write a little more (at least 10 characters)').max(5000),
})

export async function submitContact(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = formValues(fd, ['name', 'email', 'phone', 'topic', 'message'])
  const guard = await guardForm(fd, 'contact')
  if (!guard.ok) return { ok: false, message: guard.error, values }
  const parsed = contactSchema.safeParse(values)
  if (!parsed.success) return { ok: false, message: 'Please check the highlighted fields.', errors: zodErrors(parsed.error.issues), values }

  const payload = await getPayloadClient()
  const d = parsed.data
  const routedTo = INBOX[d.topic] || INBOX.general || 'secretary@bharathindusamaj.co.uk'
  const topicLabel = CONTACT_TOPICS.find((t) => t.value === d.topic)?.label ?? d.topic
  await payload.create({ collection: 'contact-messages', data: { ...d, phone: d.phone || undefined, topic: d.topic as (typeof CONTACT_TOPICS)[number]['value'], routedTo }, overrideAccess: true })
  await sendTemplate(payload, { to: routedTo, template: 'contact-routed', data: { ...d, topicLabel }, replyTo: d.email })
  await sendTemplate(payload, { to: d.email, template: 'contact-ack', data: { name: d.name } })
  return { ok: true, message: `Thank you, ${d.name}. Your message has been sent to the right team and we'll reply soon.` }
}

const NEWSLETTER_CONSENT =
  'I would like to receive the Bharat Hindu Samaj newsletter by email with news, festivals and appeal updates. I can unsubscribe at any time.'

const newsletterSchema = z.object({
  email: z.email('Please enter a valid email address').max(200),
  consent: z.literal('on', { message: 'Please tick the box to give your consent' }),
})

export async function subscribeNewsletter(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = formValues(fd, ['email'])
  const guard = await guardForm(fd, 'newsletter', 5)
  if (!guard.ok) return { ok: false, message: guard.error, values }
  const parsed = newsletterSchema.safeParse({ email: fd.get('email'), consent: fd.get('consent') })
  if (!parsed.success) return { ok: false, message: Object.values(zodErrors(parsed.error.issues))[0], errors: zodErrors(parsed.error.issues), values }

  const payload = await getPayloadClient()
  const email = parsed.data.email.toLowerCase()
  const token = randomBytes(24).toString('base64url')
  const existing = await payload.find({ collection: 'newsletter-subscribers', where: { email: { equals: email } }, limit: 1, overrideAccess: true })
  if (existing.docs[0]?.status === 'subscribed') return { ok: true, message: "You're already subscribed. Thank you!" }
  const data = { email, status: 'pending' as const, source: String(fd.get('source') ?? 'website'), consentText: NEWSLETTER_CONSENT, token }
  if (existing.docs[0]) await payload.update({ collection: 'newsletter-subscribers', id: existing.docs[0].id, data, overrideAccess: true })
  else await payload.create({ collection: 'newsletter-subscribers', data, overrideAccess: true })
  // Double opt-in (PECR): nothing is sent until the subscriber confirms
  await sendTemplate(payload, { to: email, template: 'newsletter-confirm', data: { url: `${siteUrl()}/newsletter/confirm?token=${token}` } })
  return { ok: true, message: 'Nearly done — please check your email and click the link to confirm.' }
}

const volunteerSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(100),
  email: z.email('Please enter a valid email address'),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  skills: z.array(z.enum(VOLUNTEER_SKILLS.map((s) => s.value) as [string, ...string[]])).min(1, 'Choose at least one area'),
  availability: z.array(z.enum(['weekday-mornings', 'weekday-evenings', 'weekends', 'festivals-only', 'remote'])).min(1, 'Tell us when you are free'),
  professionalSkills: z.string().trim().max(1000).optional().or(z.literal('')),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
  over18: z.literal('on', { message: 'Volunteers under 18 should ask a parent or guardian to contact us' }),
  privacy: z.literal('on', { message: 'Please agree so we can store your details' }),
})

export async function submitVolunteer(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = formValues(fd, ['name', 'email', 'phone', 'professionalSkills', 'message'])
  const guard = await guardForm(fd, 'volunteer')
  if (!guard.ok) return { ok: false, message: guard.error, values }
  const parsed = volunteerSchema.safeParse({
    ...values,
    skills: fd.getAll('skills'),
    availability: fd.getAll('availability'),
    over18: fd.get('over18'),
    privacy: fd.get('privacy'),
  })
  if (!parsed.success) return { ok: false, message: 'Please check the highlighted fields.', errors: zodErrors(parsed.error.issues), values }
  const payload = await getPayloadClient()
  const d = parsed.data
  await payload.create({
    collection: 'volunteers',
    data: {
      name: d.name,
      email: d.email,
      phone: d.phone || undefined,
      skills: d.skills as never,
      availability: d.availability,
      professionalSkills: d.professionalSkills || undefined,
      message: d.message || undefined,
      over18: true,
    },
    overrideAccess: true,
  })
  await sendTemplate(payload, { to: d.email, template: 'volunteer-welcome', data: { name: d.name } })
  return { ok: true, message: `Thank you, ${d.name}! Our volunteer coordinator will be in touch.` }
}

const shiftSchema = z.object({
  shiftId: z.coerce.number().int().positive(),
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
})

export async function signUpForShift(_prev: FormState, fd: FormData): Promise<FormState> {
  const guard = await guardForm(fd, 'shift')
  if (!guard.ok) return { ok: false, message: guard.error }
  const parsed = shiftSchema.safeParse(Object.fromEntries(fd))
  if (!parsed.success) return { ok: false, message: 'Please enter your name and a valid email.', errors: zodErrors(parsed.error.issues) }
  const payload = await getPayloadClient()
  const shift = await payload.findByID({ collection: 'volunteer-shifts', id: parsed.data.shiftId, overrideAccess: true }).catch(() => null)
  if (!shift) return { ok: false, message: 'That shift no longer exists.' }
  const signups = shift.signups ?? []
  if (signups.some((s) => s.email.toLowerCase() === parsed.data.email.toLowerCase())) return { ok: true, message: "You're already signed up for this shift." }
  if (signups.length >= shift.slots) return { ok: false, message: 'Sorry, this shift is now full.' }
  await payload.update({
    collection: 'volunteer-shifts',
    id: shift.id,
    data: { signups: [...signups, { name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone || undefined }] },
    overrideAccess: true,
  })
  return { ok: true, message: `Thank you! You're signed up for ${shift.title}.` }
}
