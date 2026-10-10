import type { EmailAdapter } from 'payload'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

/**
 * With SMTP configured, emails are sent for real. Without it (local review), they are captured
 * in the "Email outbox" collection so every journey can be checked without sending anything.
 */
const outboxAdapter: EmailAdapter = ({ payload }) => ({
  name: 'bhs-outbox',
  defaultFromAddress: process.env.EMAIL_FROM || 'no-reply@bharathindusamaj.co.uk',
  defaultFromName: 'Bharat Hindu Samaj',
  sendEmail: async (message) => {
    const to = Array.isArray(message.to) ? message.to.map(String).join(', ') : String(message.to ?? '')
    await payload.create({
      collection: 'email-outbox',
      data: { to, subject: String(message.subject ?? ''), html: String(message.html ?? message.text ?? '') },
      overrideAccess: true,
      context: { skipAudit: true },
    })
    payload.logger.info(`[email captured] to=${to} subject="${message.subject}"`)
    return { captured: true }
  },
})

export function emailAdapter() {
  if (process.env.SMTP_HOST) {
    return nodemailerAdapter({
      defaultFromAddress: process.env.EMAIL_FROM || 'no-reply@bharathindusamaj.co.uk',
      defaultFromName: 'Bharat Hindu Samaj',
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      },
    })
  }
  return outboxAdapter
}
