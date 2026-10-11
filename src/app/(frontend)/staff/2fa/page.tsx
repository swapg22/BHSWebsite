import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentStaff } from '@/lib/data'
import { isStaffAccount } from '@/access/roles'
import { TwoFactorSetup } from './TwoFactorSetup'

export const metadata: Metadata = { title: 'Two-factor sign-in', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function TwoFactorPage() {
  const user = await getCurrentStaff()
  if (!user || !isStaffAccount(user)) redirect('/staff/login')
  const u = user as { twoFactorEnabled?: boolean; roles?: string[]; email: string }
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-lg">
        <p className="eyebrow">Security</p>
        <h1 className="mt-2 text-4xl">Two-factor sign-in</h1>
        {u.twoFactorEnabled ? (
          <div className="card mt-6 p-6">
            <p className="font-semibold">Two-factor sign-in is on for {u.email}.</p>
            <p className="mt-2 text-charcoal-600">If you lose your phone, ask another administrator to untick “Two-factor sign-in enabled” on your user record, then set it up again here.</p>
            <a href="/admin" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-kumkum-700 px-5 font-semibold text-white">Go to the CMS</a>
          </div>
        ) : (
          <>
            <p className="mt-3 text-charcoal-600">
              {u.roles?.includes('administrator') ? 'Administrators must use two-factor sign-in before they can use the CMS.' : 'Protect your account with a 6-digit code from an authenticator app.'} Install Google Authenticator, Microsoft Authenticator or a similar app on your phone.
            </p>
            <TwoFactorSetup />
          </>
        )}
      </div>
    </div>
  )
}
