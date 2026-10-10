import type { Metadata } from 'next'
import { revalidatePath } from 'next/cache'
import { requireStaff } from '@/lib/staffAuth'
import { getPayloadClient } from '@/lib/data'
import { PrintButton } from '@/components/PrintButton'

export const metadata: Metadata = { title: 'Class registers', robots: { index: false } }
export const dynamic = 'force-dynamic'

async function markAttended(fd: FormData) {
  'use server'
  await requireStaff('administrator', 'membership-officer', 'treasurer')
  const payload = await getPayloadClient()
  const ids = fd.getAll('attended').map(Number)
  const all = fd.getAll('booking').map(Number)
  for (const id of all) {
    await payload.update({ collection: 'bookings', id, data: { attended: ids.includes(id) }, overrideAccess: true, context: { skipBookingHooks: true } })
  }
  revalidatePath('/staff/registers')
}

/** Registers for classes and activities (FR-36). */
export default async function RegistersPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  await requireStaff('administrator', 'membership-officer', 'treasurer')
  const date = (await searchParams).date ?? new Date().toISOString().slice(0, 10)
  const payload = await getPayloadClient()
  const start = `${date}T00:00:00.000Z`
  const end = `${date}T23:59:59.999Z`
  const { docs } = await payload.find({
    collection: 'bookings',
    where: { and: [{ startsAt: { greater_than_equal: start } }, { startsAt: { less_than_equal: end } }, { status: { in: ['confirmed', 'pending-approval', 'awaiting-payment'] } }] },
    sort: 'startsAt',
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })
  const groups = new Map<string, typeof docs>()
  for (const b of docs) {
    const k = `${b.itemTitle} · ${b.startsAt ? new Intl.DateTimeFormat('en-GB', { timeStyle: 'short', timeZone: 'Europe/London' }).format(new Date(b.startsAt)) : ''}`
    groups.set(k, [...(groups.get(k) ?? []), b])
  }
  return (
    <div className="container-page py-12">
      <p className="eyebrow no-print">Staff tools</p>
      <h1 className="mt-2 text-4xl">Registers for {new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(new Date(`${date}T12:00:00Z`))}</h1>
      <form className="no-print mt-6 flex items-end gap-3">
        <div><label htmlFor="date" className="field-label">Date</label><input id="date" type="date" name="date" defaultValue={date} className="field-input" /></div>
        <button className="min-h-12 cursor-pointer rounded-full border border-charcoal-400 px-5 font-semibold">Show</button>
        <PrintButton label="Print registers" />
      </form>
      {groups.size === 0 && <p className="mt-8 text-charcoal-600">No sign-ups for this date.</p>}
      <form action={markAttended} className="mt-8 space-y-8">
        {[...groups.entries()].map(([title, list]) => (
          <section key={title} className="card p-6">
            <h2 className="font-serif text-2xl">{title} <span className="text-base text-charcoal-500">({list.reduce((s, b) => s + (b.quantity ?? 1), 0)} places)</span></h2>
            <table className="mt-4 w-full text-left">
              <thead className="text-sm text-charcoal-600"><tr><th className="py-2">Present</th><th>Name</th><th>Phone</th><th>Places</th><th>Notes</th></tr></thead>
              <tbody className="divide-y divide-ivory-300">
                {list.map((b) => (
                  <tr key={b.id}>
                    <td className="py-2">
                      <input type="hidden" name="booking" value={b.id} />
                      <input type="checkbox" name="attended" value={b.id} defaultChecked={Boolean(b.attended)} aria-label={`${b.name} attended`} className="h-6 w-6 accent-saffron-700" />
                    </td>
                    <td>{b.name}</td>
                    <td>{b.phone}</td>
                    <td>{b.quantity}</td>
                    <td className="text-sm">{b.dietaryNotes ?? b.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
        {groups.size > 0 && <button className="no-print min-h-12 cursor-pointer rounded-full bg-saffron-700 px-6 font-semibold text-white">Save attendance</button>}
      </form>
    </div>
  )
}
