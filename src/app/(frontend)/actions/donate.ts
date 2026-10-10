'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getCurrentMember, getPayloadClient } from '@/lib/data'
import { guardForm, zodErrors, formValues, type FormState } from '@/lib/formGuard'
import { GIFT_AID_DECLARATION_TEXT, GIFT_AID_DECLARATION_VERSION, isValidUkPostcode, normalisePostcode } from '@/lib/giftaid'
import { parseAmountToPence, formatGBP, formatMoney } from '@/lib/money'
import { makeReference } from '@/lib/reference'
import { createCardCheckout, createDirectDebitCheckout } from '@/lib/payments'
import { createToken } from '@/lib/signing'
import { sendTemplate } from '@/lib/email'
import { FUND_LABELS, SUPPORTED_CURRENCIES } from '@/lib/labels'


const donateSchema = z
  .object({
    amount: z.number({ message: 'Choose or enter an amount' }).int().min(100, 'The minimum online gift is 1.00').max(10_000_000, 'For gifts over 100,000 please use the pledge form'),
    currency: z.enum(SUPPORTED_CURRENCIES),
    frequency: z.enum(['one-off', 'monthly']),
    fund: z.enum(['new-mandir', 'daily-seva', 'food-service', 'education', 'general']),
    method: z.enum(['card', 'direct-debit', 'bank-transfer', 'standing-order']),
    title: z.string().trim().max(10).optional(),
    firstName: z.string().trim().min(1, 'Enter your first name').max(60),
    lastName: z.string().trim().min(1, 'Enter your last name').max(60),
    email: z.email('Enter a valid email address').max(200),
    source: z.enum(['personal', 'company']),
    company: z.string().trim().max(120).optional(),
    giftAid: z.boolean(),
    overseas: z.boolean(),
    houseNameOrNumber: z.string().trim().max(60).optional(),
    addressLine1: z.string().trim().max(120).optional(),
    town: z.string().trim().max(80).optional(),
    postcode: z.string().trim().max(12).optional(),
    country: z.string().trim().max(60).optional(),
    donorWall: z.boolean(),
    displayName: z.string().trim().max(60).optional(),
    wallMessage: z.string().trim().max(200).optional(),
    marketing: z.boolean(),
    sponsorshipId: z.coerce.number().int().positive().optional(),
    plaqueName: z.string().trim().max(60).optional(),
    campaign: z.string().trim().max(60).regex(/^[a-z0-9-]*$/i).optional(),
  })
  .superRefine((d, ctx) => {
    if (d.method === 'direct-debit' && d.frequency !== 'monthly') ctx.addIssue({ code: 'custom', path: ['method'], message: 'Direct Debit is for monthly gifts. Choose card for a one-off gift.' })
    if (d.method === 'standing-order' && d.frequency !== 'monthly') ctx.addIssue({ code: 'custom', path: ['method'], message: 'Standing orders are for regular gifts.' })
    if (d.currency !== 'GBP' && d.method !== 'card') ctx.addIssue({ code: 'custom', path: ['method'], message: 'Gifts in other currencies can only be made by card.' })
    if (d.giftAid) {
      if (d.source !== 'personal') ctx.addIssue({ code: 'custom', path: ['giftAid'], message: 'Gift Aid can only be added to gifts of your own money, not company gifts.' })
      if (d.currency !== 'GBP') ctx.addIssue({ code: 'custom', path: ['giftAid'], message: 'Gift Aid applies to UK taxpayers giving in pounds.' })
      if (!d.houseNameOrNumber) ctx.addIssue({ code: 'custom', path: ['houseNameOrNumber'], message: 'HMRC needs your house name or number' })
      if (!d.overseas && (!d.postcode || !isValidUkPostcode(d.postcode))) ctx.addIssue({ code: 'custom', path: ['postcode'], message: 'Enter a valid UK postcode for Gift Aid' })
    }
    if (d.source === 'company' && !d.company) ctx.addIssue({ code: 'custom', path: ['company'], message: 'Enter the company name' })
    if (d.donorWall && !d.displayName) ctx.addIssue({ code: 'custom', path: ['displayName'], message: 'Tell us the name to show on the donor wall' })
  })

const FIELDS = ['amount', 'customAmount', 'currency', 'frequency', 'fund', 'method', 'title', 'firstName', 'lastName', 'email', 'source', 'company', 'houseNameOrNumber', 'addressLine1', 'town', 'postcode', 'country', 'displayName', 'wallMessage', 'plaqueName', 'campaign', 'sponsorshipId']

export async function startDonation(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = formValues(fd, FIELDS)
  const guard = await guardForm(fd, 'donate', 10)
  if (!guard.ok) return { ok: false, message: guard.error, values }

  // Preset buttons submit whole pence; "Other" is typed by the donor in pounds
  const presetPence = values.amount && values.amount !== 'other' && /^\d{3,9}$/.test(values.amount) ? Number(values.amount) : null
  const typedPence = values.amount === 'other' ? parseAmountToPence(values.customAmount) : null
  const payload = await getPayloadClient()

  // Sponsorship items have fixed amounts set by the treasurer, never by the browser
  let sponsorship: { id: number; amount: number; name: string; plaque?: boolean | null } | null = null
  if (values.sponsorshipId) {
    const item = await payload.findByID({ collection: 'sponsorship-items', id: Number(values.sponsorshipId), overrideAccess: true }).catch(() => null)
    if (!item || !item.active) return { ok: false, message: 'That sponsorship is no longer available.', values }
    if (item.totalAvailable && (item.sponsoredCount ?? 0) >= item.totalAvailable) return { ok: false, message: `Sorry, every ${item.name} has now been sponsored.`, values }
    sponsorship = { id: item.id, amount: item.amount, name: item.name, plaque: item.plaque }
  }

  const parsed = donateSchema.safeParse({
    ...values,
    amount: sponsorship ? sponsorship.amount : (presetPence ?? typedPence ?? undefined),
    currency: sponsorship ? 'GBP' : values.currency || 'GBP',
    frequency: sponsorship ? 'one-off' : values.frequency || 'one-off',
    fund: sponsorship ? 'new-mandir' : values.fund || 'new-mandir',
    method: values.method || 'card',
    source: values.source || 'personal',
    giftAid: fd.get('giftAid') === 'on',
    overseas: fd.get('overseas') === 'on',
    donorWall: fd.get('donorWall') === 'on',
    marketing: fd.get('marketing') === 'on',
    sponsorshipId: sponsorship?.id,
    title: values.title || undefined,
    company: values.company || undefined,
    houseNameOrNumber: values.houseNameOrNumber || undefined,
    addressLine1: values.addressLine1 || undefined,
    town: values.town || undefined,
    postcode: values.postcode || undefined,
    country: values.country || undefined,
    displayName: values.displayName || undefined,
    wallMessage: values.wallMessage || undefined,
    plaqueName: values.plaqueName || undefined,
    campaign: values.campaign || undefined,
  })
  if (!parsed.success) return { ok: false, message: 'Please check the highlighted fields.', errors: zodErrors(parsed.error.issues), values }
  const d = parsed.data
  const member = await getCurrentMember()
  const reference = makeReference('D')
  const now = new Date().toISOString()

  const donation = await payload.create({
    collection: 'donations',
    data: {
      reference,
      status: d.method === 'bank-transfer' || d.method === 'standing-order' ? 'awaiting-transfer' : 'pending',
      amount: d.amount,
      currency: d.currency,
      frequency: d.frequency,
      method: d.method,
      fund: d.fund,
      source: sponsorship ? 'personal' : d.source,
      company: d.company,
      sponsorship: sponsorship?.id,
      plaqueName: sponsorship?.plaque ? d.plaqueName : undefined,
      campaign: d.campaign,
      title: d.title,
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email.toLowerCase(),
      houseNameOrNumber: d.houseNameOrNumber,
      addressLine1: d.addressLine1,
      town: d.town,
      postcode: d.postcode && !d.overseas ? normalisePostcode(d.postcode) : d.postcode,
      country: d.overseas ? d.country || 'Overseas' : 'United Kingdom',
      giftAid: d.giftAid
        ? { declared: true, ukTaxpayer: true, declarationText: GIFT_AID_DECLARATION_TEXT, declarationVersion: GIFT_AID_DECLARATION_VERSION, declaredAt: now }
        : { declared: false, ukTaxpayer: false },
      donorWall: { consent: d.donorWall, displayName: d.displayName, message: d.wallMessage, approved: false },
      marketingConsent: d.marketing,
      member: member?.id,
    },
    overrideAccess: true,
  })

  if (d.marketing) {
    const existing = await payload.find({ collection: 'newsletter-subscribers', where: { email: { equals: donation.email } }, limit: 1, overrideAccess: true })
    if (!existing.docs.length) {
      await payload.create({
        collection: 'newsletter-subscribers',
        data: { email: donation.email, name: donation.donorName ?? undefined, status: 'subscribed', source: 'donation', consentText: 'Opted in to appeal updates when donating', consentedAt: now },
        overrideAccess: true,
      })
    }
  }

  const description = sponsorship
    ? `Sponsorship: ${sponsorship.name} — New Mandir`
    : `${d.frequency === 'monthly' ? 'Monthly gift' : 'Gift'} to Bharat Hindu Samaj — ${FUND_LABELS[d.fund]}`

  if (d.method === 'bank-transfer' || d.method === 'standing-order') {
    const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: true })
    await sendTemplate(payload, {
      to: donation.email,
      template: 'bank-transfer-instructions',
      data: {
        name: d.firstName,
        method: d.method === 'standing-order' ? 'standing order' : 'bank transfer',
        reference,
        amount: formatGBP(d.amount),
        accountName: settings.bank?.accountName,
        sortCode: settings.bank?.sortCode,
        accountNumber: settings.bank?.accountNumber,
      },
    })
    const t = createToken({ ref: reference }, 60 * 60 * 24 * 7)
    redirect(`/donate/bank-transfer/${reference}?t=${encodeURIComponent(t)}`)
  }

  const checkoutReq = {
    purpose: 'donation' as const,
    reference,
    amountPence: d.amount,
    currency: d.currency,
    description,
    customerEmail: donation.email,
    recurring: d.frequency === 'monthly' ? ('month' as const) : undefined,
    successPath: `/donate/thank-you?ref=${reference}`,
    cancelPath: `/donate?cancelled=1`,
  }
  let checkoutUrl: string
  try {
    const checkout = d.method === 'direct-debit' ? await createDirectDebitCheckout({ ...checkoutReq, firstName: d.firstName, lastName: d.lastName }) : await createCardCheckout(checkoutReq)
    await payload.update({ collection: 'donations', id: donation.id, data: { provider: checkout.provider, providerId: checkout.providerId }, overrideAccess: true })
    checkoutUrl = checkout.url
  } catch (err) {
    payload.logger.error({ err, msg: 'Could not start checkout' })
    return { ok: false, message: `We couldn't connect to the payment provider. Nothing has been charged. Please try again in a moment. (${formatMoney(d.amount, d.currency)})`, values }
  }
  redirect(checkoutUrl)
}

const pledgeSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(120),
  email: z.email('Enter a valid email address'),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  amount: z.number({ message: 'Enter the total amount you would like to pledge' }).int().min(100000, 'Pledges start at £1,000. For smaller gifts please use the donate page.'),
  plan: z.enum(['single', 'monthly', 'quarterly', 'annual']),
  instalments: z.coerce.number().int().min(1).max(120),
  dedication: z.string().trim().max(120).optional().or(z.literal('')),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
  contactPreference: z.enum(['email', 'phone', 'in-person']),
})

export async function submitPledge(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = formValues(fd, ['name', 'email', 'phone', 'amount', 'plan', 'instalments', 'dedication', 'message', 'contactPreference'])
  const guard = await guardForm(fd, 'pledge')
  if (!guard.ok) return { ok: false, message: guard.error, values }
  const parsed = pledgeSchema.safeParse({ ...values, amount: parseAmountToPence(values.amount) ?? undefined, instalments: values.plan === 'single' ? 1 : values.instalments })
  if (!parsed.success) return { ok: false, message: 'Please check the highlighted fields.', errors: zodErrors(parsed.error.issues), values }
  const d = parsed.data
  const payload = await getPayloadClient()
  const reference = makeReference('P')
  await payload.create({
    collection: 'pledges',
    data: { reference, name: d.name, email: d.email, phone: d.phone || undefined, amount: d.amount, plan: d.plan, instalments: d.instalments, dedication: d.dedication || undefined, message: d.message || undefined, contactPreference: d.contactPreference },
    overrideAccess: true,
  })
  const plan = d.plan === 'single' ? 'Single gift' : `${d.instalments} ${d.plan} instalments of ${formatGBP(Math.ceil(d.amount / d.instalments))}`
  await sendTemplate(payload, { to: d.email, template: 'pledge-received', data: { name: d.name, amount: formatGBP(d.amount), reference, plan } })
  await sendTemplate(payload, {
    to: process.env.INBOX_DONATIONS || 'treasurer@bharathindusamaj.co.uk',
    template: 'contact-routed',
    data: { name: d.name, email: d.email, phone: d.phone, topicLabel: `New pledge ${reference}`, message: `${formatGBP(d.amount)} — ${plan}\nPreferred contact: ${d.contactPreference}\n\n${d.message ?? ''}` },
  })
  return { ok: true, message: `Thank you, ${d.name}. Your pledge of ${formatGBP(d.amount)} has been recorded (reference ${reference}). A trustee will contact you personally.` }
}
