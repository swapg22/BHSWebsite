import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/data'
import { isReference } from '@/lib/reference'
import { ButtonLink, LotusMark } from '@/components/ui'

export const metadata: Metadata = { title: 'Welcome', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function WelcomePage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams
  const payload = await getPayloadClient()
  const p = ref && isReference(ref) ? (await payload.find({ collection: 'payments', where: { receiptNumber: { equals: ref } }, limit: 1, overrideAccess: true, depth: 1 })).docs[0] : null
  const member = p && typeof p.member === 'object' ? p.member : null
  return (
    <div className="container-page py-20 text-center">
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-kumkum-700 text-ivory-50"><LotusMark className="h-11 w-11" /></span>
      <h1 className="mt-6 text-5xl">Welcome to the Samaj{member ? `, ${member.firstName}` : ''}</h1>
      {p?.status === 'paid' && member ? (
        <p className="mx-auto mt-4 max-w-xl text-xl text-charcoal-700">Your membership is active. Your membership number is <strong>{member.membershipNumber}</strong>, and a confirmation is on its way by email.</p>
      ) : (
        <p className="mx-auto mt-4 max-w-xl text-xl text-charcoal-700">We are confirming your payment. You will receive an email as soon as your membership is active.</p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/account">Go to my account</ButtonLink>
        <ButtonLink href="/activities" variant="secondary">See free classes</ButtonLink>
      </div>
    </div>
  )
}
