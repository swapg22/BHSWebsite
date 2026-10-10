import type { Metadata } from 'next'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { getCurrentMember } from '@/lib/data'
import { formStartToken } from '@/lib/formGuard'
import { paymentsMode } from '@/lib/payments'
import { PageHeader, Notice, ButtonLink } from '@/components/ui'
import { JoinForm } from './JoinForm'

export const metadata: Metadata = { title: 'Become a member', description: 'Join Bharat Hindu Samaj for £20 a year. Member prices for poojas and hall hire, free classes, and a vote at the AGM.' }
export const dynamic = 'force-dynamic'

export default async function MembershipPage({ searchParams }: { searchParams: Promise<{ cancelled?: string; failed?: string }> }) {
  const sp = await searchParams
  const member = await getCurrentMember()
  return (
    <>
      <PageHeader eyebrow="Membership" title="Join Bharat Hindu Samaj for £20 a year" intro="Annual membership is £20 per person aged 18 or over. Join online in a few minutes and pay securely by card." />
      <div className="container-page grid gap-12 py-14 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <div className="card sticky top-28 p-6">
            <p className="font-serif text-5xl text-saffron-700">£20</p>
            <p className="text-charcoal-600">per person, per year</p>
            <ul className="mt-6 space-y-3">
              {['Member prices for poojas, ceremonies and hall hire', 'Free weekly classes: yoga, dance, languages, sport', 'Lunch club and community events', 'Vote and stand for election at the AGM', 'Your own account: renew, bookings and receipts online'].map((b) => (
                <li key={b} className="flex gap-3"><Check aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-saffron-700" />{b}</li>
              ))}
            </ul>
          </div>
        </aside>
        <div className="space-y-6 lg:col-span-8">
          {sp.cancelled && <Notice tone="warning">Payment was cancelled. Your details are saved — sign in to your account to pay and activate your membership.</Notice>}
          {paymentsMode().card === 'demo' && <Notice title="Test mode">Payments use the demo checkout until Stripe keys are added. No money moves.</Notice>}
          {member && member.status === 'active' ? (
            <div className="card p-8">
              <h2 className="font-serif text-3xl">You are already a member</h2>
              <p className="mt-2 text-charcoal-600">Membership number {member.membershipNumber}. You can renew or update your details in your account.</p>
              <div className="mt-6"><ButtonLink href="/account">Go to my account</ButtonLink></div>
            </div>
          ) : (
            <>
              <p className="text-charcoal-600">
                Already a member? <Link href="/account/login?next=/account" className="font-semibold text-saffron-800 underline">Sign in to renew</Link>.
              </p>
              <JoinForm token={formStartToken()} />
            </>
          )}
        </div>
      </div>
    </>
  )
}
