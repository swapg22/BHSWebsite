import type { Payload } from 'payload'

/** Transactional email templates. All dynamic values are HTML-escaped. */

export function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

type Data = Record<string, unknown>

interface Template {
  subject: (d: Data) => string
  body: (d: Data) => string // trusted HTML built from escaped values
}

const e = escapeHtml
const button = (url: unknown, label: string) =>
  `<p style="margin:28px 0"><a href="${e(url)}" style="background:#B83700;color:#ffffff;padding:14px 22px;border-radius:999px;text-decoration:none;font-weight:600;display:inline-block">${e(label)}</a></p>`
const rows = (items: [string, unknown][]) =>
  `<table role="presentation" style="width:100%;border-collapse:collapse;margin:16px 0">${items
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 0;color:#5E544C;border-bottom:1px solid #EFE6DA;width:45%">${e(k)}</td><td style="padding:8px 0;border-bottom:1px solid #EFE6DA;font-weight:600">${e(v)}</td></tr>`,
    )
    .join('')}</table>`

export const TEMPLATES = {
  'staff-invite': {
    subject: () => "You've been invited to the Bharat Hindu Samaj website CMS",
    body: (d) =>
      `<p>Namaste ${e(d.name)},</p><p>You have been given access to the Bharat Hindu Samaj website as: <strong>${e(d.roles)}</strong>.</p>${button(d.url, 'Set your password')}<p>Administrators will be asked to set up two-factor sign-in with an authenticator app.</p>`,
  },
  'magic-link': {
    subject: () => 'Your sign-in link for Bharat Hindu Samaj',
    body: (d) =>
      `<p>Namaste ${e(d.name)},</p><p>Use the button below to sign in. The link works once and expires in 15 minutes.</p>${button(d.url, 'Sign in')}<p>If you didn't ask for this, you can ignore this email.</p>`,
  },
  'member-reset': {
    subject: () => 'Reset your Bharat Hindu Samaj password',
    body: (d) => `<p>Namaste ${e(d.name)},</p><p>Use the button below to choose a new password. The link expires in one hour.</p>${button(d.url, 'Choose a new password')}`,
  },
  'membership-confirmed': {
    subject: (d) => `Welcome to Bharat Hindu Samaj — membership ${e(d.membershipNumber)}`,
    body: (d) =>
      `<p>Namaste ${e(d.name)},</p><p>Thank you for joining Bharat Hindu Samaj. Your membership is now active.</p>${rows([
        ['Membership number', d.membershipNumber],
        ['Valid until', d.expiry],
        ['Amount paid', d.amount],
        ['Receipt number', d.receiptNumber],
      ])}${button(d.accountUrl, 'View your account')}`,
  },
  'renewal-reminder': {
    subject: (d) => (Number(d.days) > 0 ? `Your membership renews in ${e(d.days)} days` : 'Your membership has expired'),
    body: (d) =>
      `<p>Namaste ${e(d.name)},</p><p>Your Bharat Hindu Samaj membership ${Number(d.days) > 0 ? `ends on <strong>${e(d.expiry)}</strong>` : `ended on <strong>${e(d.expiry)}</strong>`}. Renewing keeps your member prices for poojas, hall hire and events.</p>${button(d.renewUrl, 'Renew for £20')}`,
  },
  'donation-receipt': {
    subject: (d) => `Thank you for your gift — receipt ${e(d.reference)}`,
    body: (d) =>
      `<p>Namaste ${e(d.name)},</p><p>Thank you for supporting Bharat Hindu Samaj. Your generosity ${d.fund === 'new-mandir' ? 'brings the new Mandir a step closer' : 'keeps our Mandir serving the community'}.</p>${rows([
        ['Reference', d.reference],
        ['Amount', d.amount],
        ['Frequency', d.frequency],
        ['Fund', d.fundLabel],
        ['Gift Aid', d.giftAid],
        ['Date', d.date],
      ])}${button(d.receiptUrl, 'Download your receipt')}<p style="color:#5E544C;font-size:13px">Bharat Hindu Samaj is a registered charity in England and Wales (274404).</p>`,
  },
  'bank-transfer-instructions': {
    subject: (d) => `Bank transfer details — reference ${e(d.reference)}`,
    body: (d) =>
      `<p>Namaste ${e(d.name)},</p><p>Thank you for choosing to give by ${e(d.method)}. Please use the reference below so our treasurer can match your gift.</p>${rows([
        ['Reference', d.reference],
        ['Amount', d.amount],
        ['Account name', d.accountName],
        ['Sort code', d.sortCode],
        ['Account number', d.accountNumber],
      ])}`,
  },
  'booking-received': {
    subject: (d) => `We've received your request — ${e(d.reference)}`,
    body: (d) =>
      `<p>Namaste ${e(d.name)},</p><p>Thank you. Your request for <strong>${e(d.service)}</strong> has been received and will be reviewed by the temple office. We'll email you once it is approved.</p>${rows([
        ['Reference', d.reference],
        ['Date', d.date],
        ['Time', d.time],
        ['Estimated cost', d.amount],
      ])}`,
  },
  'booking-confirmed': {
    subject: (d) => `Booking confirmed — ${e(d.service)}`,
    body: (d) =>
      `<p>Namaste ${e(d.name)},</p><p>Your booking is confirmed.</p>${rows([
        ['Reference', d.reference],
        ['Booking', d.service],
        ['Date', d.date],
        ['Time', d.time],
        ['Places', d.quantity],
        ['Paid', d.amount],
      ])}${d.calendarUrl ? button(d.calendarUrl, 'Add to Google Calendar') : ''}${d.accountUrl ? `<p><a href="${e(d.accountUrl)}">Manage or cancel your booking</a></p>` : ''}`,
  },
  'booking-waitlisted': {
    subject: (d) => `You're on the waiting list — ${e(d.service)}`,
    body: (d) =>
      `<p>Namaste ${e(d.name)},</p><p><strong>${e(d.service)}</strong> is currently full, so we've added you to the waiting list (reference ${e(d.reference)}). We'll email you if a place becomes available.</p>`,
  },
  'booking-cancelled': {
    subject: (d) => `Booking cancelled — ${e(d.reference)}`,
    body: (d) =>
      `<p>Namaste ${e(d.name)},</p><p>Your booking for <strong>${e(d.service)}</strong> has been cancelled.</p>${rows([
        ['Reference', d.reference],
        ['Refund', d.refund],
        ['Reason', d.reason],
      ])}`,
  },
  'booking-rejected': {
    subject: (d) => `About your request — ${e(d.reference)}`,
    body: (d) =>
      `<p>Namaste ${e(d.name)},</p><p>We're sorry, we're unable to accept your request for <strong>${e(d.service)}</strong> on ${e(d.date)}.</p>${d.note ? `<p>${e(d.note)}</p>` : ''}<p>Please contact the temple office if you would like to discuss another date.</p>`,
  },
  'pledge-received': {
    subject: () => 'Thank you for your pledge to the new Mandir',
    body: (d) =>
      `<p>Namaste ${e(d.name)},</p><p>Thank you for pledging <strong>${e(d.amount)}</strong> towards the new Mandir. A trustee will contact you personally to agree the details.</p>${rows([
        ['Reference', d.reference],
        ['Plan', d.plan],
      ])}`,
  },
  'volunteer-welcome': {
    subject: () => 'Thank you for offering to volunteer',
    body: (d) =>
      `<p>Namaste ${e(d.name)},</p><p>Thank you for offering your time to Bharat Hindu Samaj. Our volunteer coordinator will be in touch about the areas you chose.</p>`,
  },
  'contact-routed': {
    subject: (d) => `[Website] ${e(d.topicLabel)}: message from ${e(d.name)}`,
    body: (d) =>
      `<p>New message from the website contact form.</p>${rows([
        ['Name', d.name],
        ['Email', d.email],
        ['Phone', d.phone],
        ['Topic', d.topicLabel],
      ])}<p style="white-space:pre-wrap;border-left:3px solid #E9D9C4;padding-left:12px">${e(d.message)}</p>`,
  },
  'contact-ack': {
    subject: () => 'We received your message',
    body: (d) => `<p>Namaste ${e(d.name)},</p><p>Thank you for contacting Bharat Hindu Samaj. A member of the team will reply soon.</p>`,
  },
  'newsletter-confirm': {
    subject: () => 'Please confirm your newsletter subscription',
    body: (d) =>
      `<p>Namaste,</p><p>Please confirm you'd like to receive the Bharat Hindu Samaj newsletter with news, festivals and appeal updates.</p>${button(d.url, 'Confirm subscription')}<p>You can unsubscribe at any time.</p>`,
  },
} satisfies Record<string, Template>

export type TemplateName = keyof typeof TEMPLATES

export function renderEmail(template: TemplateName, data: Data): { subject: string; html: string } {
  const t = TEMPLATES[template]
  const html = `<!doctype html><html><body style="margin:0;background:#FBF6EE;font-family:Inter,Segoe UI,Arial,sans-serif;color:#1F1B18">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
<p style="font-family:Georgia,serif;font-size:22px;color:#B83700;margin:0 0 24px">Bharat Hindu Samaj</p>
<div style="background:#ffffff;border-radius:16px;padding:28px;line-height:1.6;font-size:16px">${t.body(data)}</div>
<p style="color:#5E544C;font-size:12px;margin-top:24px;line-height:1.5">Bharat Hindu Samaj, Unit 6, New England Complex, Rock Road, Peterborough PE1 3BU · Registered charity 274404</p>
</div></body></html>`
  return { subject: t.subject(data), html }
}

export async function sendTemplate(
  payload: Payload,
  { to, template, data, replyTo }: { to: string; template: TemplateName; data: Data; replyTo?: string },
): Promise<void> {
  const { subject, html } = renderEmail(template, data)
  try {
    await payload.sendEmail({ to, subject, html, replyTo })
  } catch (err) {
    payload.logger.error({ err, msg: `Failed to send "${template}" email` })
  }
}
