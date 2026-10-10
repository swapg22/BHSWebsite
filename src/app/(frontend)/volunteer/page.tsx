import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/data'
import { formStartToken } from '@/lib/formGuard'
import { PageHeader } from '@/components/ui'
import { VolunteerForm, ShiftSignup } from './forms'

export const metadata: Metadata = { title: 'Volunteer', description: 'Give your time and skills to Bharat Hindu Samaj and the new Mandir.' }
export const dynamic = 'force-dynamic'

const fmt = (d: string) => new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Europe/London' }).format(new Date(d))

export default async function VolunteerPage() {
  const payload = await getPayloadClient()
  const shifts = await payload.find({ collection: 'volunteer-shifts', where: { startsAt: { greater_than: new Date().toISOString() } }, sort: 'startsAt', limit: 20, depth: 0, overrideAccess: true })
  const token = formStartToken()
  return (
    <>
      <PageHeader eyebrow="Seva" title="Volunteer with us" intro="Almost everything at the Samaj is run by volunteers — from cooking prasad to teaching Gujarati. The new Mandir will need builders, architects, lawyers, fundraisers and many more." />
      <div className="container-page grid gap-12 py-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="mb-6 text-3xl">Offer your time and skills</h2>
          <VolunteerForm token={token} />
        </div>
        <aside className="lg:col-span-5">
          <h2 className="mb-6 text-3xl">Upcoming shifts</h2>
          {shifts.docs.length === 0 && <p className="text-charcoal-600">No shifts open right now.</p>}
          <ul className="space-y-4">
            {shifts.docs.map((s) => {
              const left = s.slots - (s.signups?.length ?? 0)
              return (
                <li key={s.id} className="card p-5">
                  <p className="font-serif text-xl">{s.title}</p>
                  <p className="text-sm text-charcoal-600">{fmt(s.startsAt)} · {left > 0 ? `${left} of ${s.slots} places left` : 'Full'}</p>
                  {s.description && <p className="mt-1 text-sm text-charcoal-600">{s.description}</p>}
                  {left > 0 && <ShiftSignup shiftId={s.id} token={token} />}
                </li>
              )
            })}
          </ul>
        </aside>
      </div>
    </>
  )
}
