import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/data'
import { Notice } from '@/components/ui'

export const metadata: Metadata = { title: 'Newsletter', robots: { index: false } }
export const dynamic = 'force-dynamic'

/** Double opt-in confirmation (PECR). Also handles ?action=unsubscribe. */
export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string; action?: string }> }) {
  const { token, action } = await searchParams
  const payload = await getPayloadClient()
  const sub = token && /^[A-Za-z0-9_-]{20,}$/.test(token) ? (await payload.find({ collection: 'newsletter-subscribers', where: { token: { equals: token } }, limit: 1, overrideAccess: true, showHiddenFields: true })).docs[0] : null
  let message = 'This link is not valid. Please sign up again.'
  let ok = false
  if (sub) {
    if (action === 'unsubscribe') {
      await payload.update({ collection: 'newsletter-subscribers', id: sub.id, data: { status: 'unsubscribed' }, overrideAccess: true })
      message = 'You have been unsubscribed. We’re sorry to see you go.'
    } else {
      await payload.update({ collection: 'newsletter-subscribers', id: sub.id, data: { status: 'subscribed', consentedAt: new Date().toISOString() }, overrideAccess: true })
      message = 'Thank you — your subscription is confirmed.'
    }
    ok = true
  }
  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-4xl">Newsletter</h1>
        <Notice tone={ok ? 'success' : 'error'}>{message}</Notice>
      </div>
    </div>
  )
}
