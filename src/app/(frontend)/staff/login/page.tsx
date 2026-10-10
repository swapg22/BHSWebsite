import type { Metadata } from 'next'
import { StaffLoginForm } from './StaffLoginForm'

export const metadata: Metadata = { title: 'Staff sign in', robots: { index: false } }

export default function StaffLoginPage() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-md">
        <p className="eyebrow">Content management</p>
        <h1 className="mt-2 text-4xl">Staff sign in</h1>
        <p className="mt-2 text-charcoal-600">For committee members, editors, the treasurer and the membership officer.</p>
        <StaffLoginForm />
        <p className="mt-6 text-center text-sm text-charcoal-600"><a href="/admin/forgot" className="underline">Forgotten your password?</a></p>
      </div>
    </div>
  )
}
