import type { Metadata } from 'next'
import { requireStaff } from '@/lib/staffAuth'
import { ImportForm } from './ImportForm'

export const metadata: Metadata = { title: 'Import members', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function ImportPage() {
  await requireStaff('administrator', 'membership-officer')
  return (
    <div className="container-page py-12">
      <p className="eyebrow">Staff tools</p>
      <h1 className="mt-2 text-4xl">Import the member list</h1>
      <p className="mt-3 max-w-3xl text-charcoal-600">
        Upload the Excel export with these columns: <strong>Membership number, Name, Address, Email, Phone number, Receipt number, Opted for newsletter, Member since, Date last membership paid</strong>. First run a check: duplicates, missing emails and unreadable dates are reported so you can fix them in Excel before importing. Imported members sign in with “Email me a link”.
      </p>
      <ImportForm />
    </div>
  )
}
