import type { Metadata } from 'next'
import { ResetForm } from './ResetForm'

export const metadata: Metadata = { title: 'Choose a new password', robots: { index: false } }

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-4xl">Choose a new password</h1>
        <ResetForm token={token ?? ''} />
      </div>
    </div>
  )
}
