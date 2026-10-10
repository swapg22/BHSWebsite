import { parse } from 'gocardless-nodejs'
import { getPayloadClient } from '@/lib/data'
import { goCardless, startDirectDebitSubscription } from '@/lib/payments'
import { fulfilDonation, recordRecurringPayment, markPaymentFailed } from '@/lib/fulfilment'

/**
 * GoCardless webhook (signature verified). When a billing request is fulfilled, the mandate
 * exists: start the monthly subscription and mark the gift active. Each confirmed payment
 * after the first is recorded as its own gift so Gift Aid can be claimed per payment.
 */
export async function POST(req: Request) {
  const secret = process.env.GOCARDLESS_WEBHOOK_SECRET
  const gc = goCardless()
  if (!secret || !gc) return new Response('GoCardless not configured', { status: 503 })
  const body = await req.text()
  let events
  try {
    events = parse(body, secret, req.headers.get('webhook-signature') ?? '')
  } catch {
    return new Response('Invalid signature', { status: 498 })
  }
  const payload = await getPayloadClient()
  try {
    for (const ev of events) {
      if (ev.resource_type === 'billing_requests' && ev.action === 'fulfilled') {
        const br = await gc.billingRequests.find(ev.links!.billing_request!)
        const reference = String(br.metadata?.reference ?? '')
        const amount = Number(br.metadata?.amount ?? 0)
        const mandate = br.links?.mandate_request_mandate
        if (reference && mandate && amount) {
          const sub = await startDirectDebitSubscription(mandate, amount, reference)
          await fulfilDonation(payload, reference, { provider: 'gocardless', providerId: mandate, subscriptionId: sub?.id })
        }
      } else if (ev.resource_type === 'payments' && ev.action === 'confirmed') {
        const p = await gc.payments.find(ev.links!.payment!)
        const subId = p.links?.subscription
        if (subId) {
          const { docs } = await payload.find({ collection: 'donations', where: { providerSubscriptionId: { equals: subId } }, limit: 1, overrideAccess: true, depth: 0 })
          const parent = docs[0]
          // The first collection belongs to the original gift; record later ones separately
          if (parent && parent.paidAt && Date.now() - new Date(parent.paidAt).getTime() > 20 * 864e5) {
            await recordRecurringPayment(payload, parent.reference, { provider: 'gocardless', providerId: p.id!, amountPence: Number(p.amount), paidAt: new Date(p.charge_date ?? Date.now()) })
          }
        }
      } else if (ev.resource_type === 'billing_requests' && (ev.action === 'cancelled' || ev.action === 'failed')) {
        const br = await gc.billingRequests.find(ev.links!.billing_request!)
        if (br.metadata?.reference) await markPaymentFailed(payload, 'donation', String(br.metadata.reference))
      }
    }
  } catch (err) {
    payload.logger.error({ err, msg: 'GoCardless webhook failed' })
    return new Response('Handler error', { status: 500 })
  }
  return new Response(null, { status: 204 })
}
