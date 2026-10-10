import type Stripe from 'stripe'
import { getPayloadClient } from '@/lib/data'
import { stripe } from '@/lib/payments'
import { fulfilByPurpose, markPaymentFailed, recordRecurringPayment } from '@/lib/fulfilment'

/**
 * Stripe webhook. The signature is verified against the raw body, so events cannot be forged.
 * Handled: checkout completed (first payment), invoice paid (each later monthly/annual payment),
 * async payment failed.
 */
export async function POST(req: Request) {
  const s = stripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!s || !secret) return new Response('Stripe not configured', { status: 503 })
  const body = await req.text()
  let event: Stripe.Event
  try {
    event = s.webhooks.constructEvent(body, req.headers.get('stripe-signature') ?? '', secret)
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }
  const payload = await getPayloadClient()
  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
        const { purpose, reference } = session.metadata ?? {}
        if (purpose && reference) {
          await fulfilByPurpose(payload, purpose, reference, {
            provider: 'stripe',
            providerId: String(session.payment_intent ?? session.id),
            subscriptionId: session.subscription ? String(session.subscription) : undefined,
          })
        }
      }
    } else if (event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object as Stripe.Checkout.Session
      const { purpose, reference } = session.metadata ?? {}
      if (purpose && reference) await markPaymentFailed(payload, purpose, reference)
    } else if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice & { subscription_details?: { metadata?: Record<string, string> } }
      const meta = invoice.parent?.subscription_details?.metadata ?? invoice.subscription_details?.metadata ?? {}
      if (invoice.billing_reason === 'subscription_cycle' && meta.reference) {
        if (meta.purpose === 'donation') {
          await recordRecurringPayment(payload, meta.reference, { provider: 'stripe', providerId: invoice.id!, amountPence: invoice.amount_paid, paidAt: new Date((invoice.status_transitions?.paid_at ?? Date.now() / 1000) * 1000) })
        } else if (meta.purpose === 'membership') {
          // Annual auto-renewal: create a fresh payment row and extend the membership
          const { docs } = await payload.find({ collection: 'payments', where: { receiptNumber: { equals: meta.reference } }, limit: 1, overrideAccess: true, depth: 0 })
          const first = docs[0]
          if (first?.member) {
            const { makeReference } = await import('@/lib/reference')
            const receipt = makeReference('M')
            await payload.create({ collection: 'payments', data: { receiptNumber: receipt, purpose: 'membership', status: 'pending', amount: invoice.amount_paid, member: typeof first.member === 'object' ? first.member.id : first.member, payerEmail: first.payerEmail, payerName: first.payerName, description: 'Annual membership (auto-renewal)' }, overrideAccess: true })
            await fulfilByPurpose(payload, 'membership', receipt, { provider: 'stripe', providerId: invoice.id! })
          }
        }
      }
    }
  } catch (err) {
    payload.logger.error({ err, msg: `Stripe webhook ${event.type} failed` })
    return new Response('Handler error', { status: 500 }) // Stripe retries
  }
  return Response.json({ received: true })
}
