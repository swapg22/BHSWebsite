import Stripe from 'stripe'
import gocardless, { Environments } from 'gocardless-nodejs'
import { createToken } from '@/lib/signing'

/**
 * Payment providers (spec option A, FR-26): Stripe Checkout for cards, Apple Pay and Google Pay;
 * GoCardless for UK Direct Debit. Card details are entered on the provider's hosted pages and
 * never reach our servers (NFR-03). Without keys, a built-in demo checkout simulates payment
 * so every journey can be tested end to end without moving money.
 */

export type PaymentPurpose = 'donation' | 'membership' | 'booking'

export interface CheckoutRequest {
  purpose: PaymentPurpose
  reference: string
  amountPence: number
  currency?: string
  description: string
  customerEmail: string
  recurring?: 'month' | 'year'
  successPath: string
  cancelPath: string
}

export interface CheckoutResult {
  url: string
  provider: 'stripe' | 'gocardless' | 'demo'
  providerId: string
}

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

let stripeClient: Stripe | null = null
export function stripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null
  stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY)
  return stripeClient
}

export function goCardless() {
  if (!process.env.GOCARDLESS_ACCESS_TOKEN) return null
  return gocardless(
    process.env.GOCARDLESS_ACCESS_TOKEN,
    process.env.GOCARDLESS_ENVIRONMENT === 'live' ? Environments.Live : Environments.Sandbox,
  )
}

export function paymentsMode(): { card: 'stripe' | 'demo'; directDebit: 'gocardless' | 'demo' } {
  return { card: stripe() ? 'stripe' : 'demo', directDebit: goCardless() ? 'gocardless' : 'demo' }
}

/**
 * The demo checkout lets anyone "pay" without money moving, so it is only available in
 * development, or on a review deployment that explicitly sets ALLOW_DEMO_PAYMENTS=true.
 */
export function demoPaymentsAllowed(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEMO_PAYMENTS === 'true'
}

function demoCheckout(req: CheckoutRequest, method: 'card' | 'direct-debit'): CheckoutResult {
  if (!demoPaymentsAllowed()) throw new Error('Payments are not configured: set STRIPE_SECRET_KEY / GOCARDLESS_ACCESS_TOKEN')
  const token = createToken(
    {
      purpose: req.purpose,
      reference: req.reference,
      amount: req.amountPence,
      currency: req.currency ?? 'GBP',
      description: req.description,
      recurring: req.recurring ?? null,
      method,
      successPath: req.successPath,
      cancelPath: req.cancelPath,
    },
    60 * 60,
  )
  return { url: `${siteUrl()}/checkout/demo?token=${encodeURIComponent(token)}`, provider: 'demo', providerId: `demo_${req.reference}` }
}

export async function createCardCheckout(req: CheckoutRequest): Promise<CheckoutResult> {
  const s = stripe()
  if (!s) return demoCheckout(req, 'card')
  const currency = (req.currency ?? 'GBP').toLowerCase()
  const metadata = { purpose: req.purpose, reference: req.reference }
  const session = await s.checkout.sessions.create(
    {
      mode: req.recurring ? 'subscription' : 'payment',
      customer_email: req.customerEmail,
      client_reference_id: req.reference,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: req.amountPence,
            product_data: { name: req.description },
            ...(req.recurring ? { recurring: { interval: req.recurring } } : {}),
          },
        },
      ],
      metadata,
      ...(req.recurring ? { subscription_data: { metadata } } : { payment_intent_data: { metadata } }),
      success_url: `${siteUrl()}${req.successPath}${req.successPath.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}${req.cancelPath}`,
    },
    { idempotencyKey: `checkout-${req.reference}` },
  )
  return { url: session.url!, provider: 'stripe', providerId: session.id }
}

/** Monthly Direct Debit via a GoCardless Billing Request Flow (mandate set-up on GoCardless' page). */
export async function createDirectDebitCheckout(req: CheckoutRequest & { firstName: string; lastName: string }): Promise<CheckoutResult> {
  const gc = goCardless()
  if (!gc) return demoCheckout(req, 'direct-debit')
  const br = await gc.billingRequests.create(
    {
      mandate_request: { scheme: 'bacs', currency: 'GBP' },
      metadata: { reference: req.reference, purpose: req.purpose, amount: String(req.amountPence) },
    },
    `br-${req.reference}`,
  )
  const flow = await gc.billingRequestFlows.create({
    redirect_uri: `${siteUrl()}${req.successPath}`,
    exit_uri: `${siteUrl()}${req.cancelPath}`,
    prefilled_customer: { email: req.customerEmail, given_name: req.firstName, family_name: req.lastName },
    links: { billing_request: br.id! },
  })
  return { url: flow.authorisation_url!, provider: 'gocardless', providerId: br.id! }
}

/** Starts the monthly collection once the mandate exists (called from the GoCardless webhook). */
export async function startDirectDebitSubscription(mandateId: string, amountPence: number, reference: string) {
  const gc = goCardless()
  if (!gc) return null
  return gc.subscriptions.create(
    {
      amount: amountPence,
      currency: 'GBP',
      interval_unit: 'monthly',
      name: 'Monthly gift to Bharat Hindu Samaj',
      links: { mandate: mandateId },
      metadata: { reference },
    },
    `sub-${reference}`,
  )
}

export async function refundPayment(provider: string | null | undefined, providerId: string | null | undefined, amountPence: number): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (amountPence <= 0) return { ok: true }
  if (!provider || provider === 'demo' || !providerId) return { ok: true, id: `demo_refund_${Date.now()}` }
  if (provider === 'stripe') {
    const s = stripe()
    if (!s) return { ok: false, error: 'Stripe is not configured' }
    try {
      let paymentIntent = providerId
      if (providerId.startsWith('cs_')) {
        const session = await s.checkout.sessions.retrieve(providerId)
        paymentIntent = String(session.payment_intent)
      }
      const refund = await s.refunds.create({ payment_intent: paymentIntent, amount: amountPence })
      return { ok: true, id: refund.id }
    } catch (err) {
      return { ok: false, error: (err as Error).message }
    }
  }
  return { ok: false, error: `Refunds for ${provider} must be issued from the provider dashboard` }
}
