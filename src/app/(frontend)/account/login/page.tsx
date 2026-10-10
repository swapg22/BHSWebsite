import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentMember } from '@/lib/data'
import { Notice } from '@/components/ui'
import { LoginForms } from './LoginForms'

export const metadata: Metadata = { title: 'Member sign in', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams
  if (await getCurrentMember()) redirect('/account')
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-4xl">Member sign in</h1>
        <p className="mt-2 text-charcoal-600">Renew your membership, see your bookings and download receipts.</p>
        {error === 'link' && <div className="mt-4"><Notice tone="error">That sign-in link has expired or was already used. Please request a new one.</Notice></div>}
        <LoginForms next={next && next.startsWith('/') && !next.startsWith('//') ? next : '/account'} />
        <p className="mt-8 text-center text-charcoal-600">Not a member yet? <Link href="/membership" className="font-semibold text-saffron-800 underline">Join for £20 a year</Link></p>
      </div>
    </div>
  )
}
