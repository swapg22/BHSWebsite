import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'
import { readToken } from '@/lib/signing'
import { demoPaymentsAllowed } from '@/lib/payments'
import { formatMoney } from '@/lib/money'
import { completeDemoCheckout } from '@/app/(frontend)/actions/booking'

export const metadata: Metadata = { title: 'Test checkout', robots: { index: false } }
export const dynamic = 'force-dynamic'

/** Stand-in for Stripe/GoCardless hosted pages while no keys are configured. Development only. */
export default async function DemoCheckout({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  const data = readToken<{ amount: number; currency: string; description: string; recurring: string | null; method: string }>(token)
  if (!data || !demoPaymentsAllowed()) notFound()
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-md rounded-3xl border-2 border-dashed border-saffron-300 bg-white p-8">
        <p className="flex items-center gap-2 font-semibold text-saffron-800"><ShieldAlert aria-hidden="true" className="h-5 w-5" /> Test checkout — no money moves</p>
        <p className="mt-2 text-sm text-charcoal-600">This page stands in for {data.method === 'direct-debit' ? 'GoCardless' : 'Stripe Checkout (card, Apple Pay, Google Pay)'} until live keys are added.</p>
        <dl className="mt-6 divide-y divide-ivory-300 border-y border-ivory-300">
          <div className="flex justify-between py-3"><dt className="text-charcoal-600">For</dt><dd className="text-right font-semibold">{data.description}</dd></div>
          <div className="flex justify-between py-3"><dt className="text-charcoal-600">Amount</dt><dd className="font-semibold">{formatMoney(data.amount, data.currency)}{data.recurring ? ` / ${data.recurring}` : ''}</dd></div>
        </dl>
        <form action={completeDemoCheckout} className="mt-6 grid gap-3">
          <input type="hidden" name="token" value={token} />
          <button name="outcome" value="success" className="min-h-12 cursor-pointer rounded-full bg-saffron-700 font-semibold text-white hover:bg-saffron-800">Simulate successful payment</button>
          <button name="outcome" value="fail" className="min-h-12 cursor-pointer rounded-full border border-charcoal-400 font-semibold hover:bg-ivory-100">Simulate declined payment</button>
          <button name="outcome" value="cancel" className="min-h-12 cursor-pointer rounded-full font-semibold text-charcoal-600 hover:bg-ivory-100">Cancel and go back</button>
        </form>
      </div>
    </div>
  )
}
