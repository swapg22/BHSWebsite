import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/data'
import { PageHeader, ButtonLink } from '@/components/ui'

export const metadata: Metadata = { title: 'Donor wall', description: 'With thanks to everyone giving to the new Mandir.' }
export const revalidate = 300

/** Donor wall (FR-24): only donors who consented, and only after staff approval. Amounts are never shown. */
export default async function DonorWallPage() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'donations',
    where: { and: [{ 'donorWall.consent': { equals: true } }, { 'donorWall.approved': { equals: true } }, { status: { in: ['paid', 'active'] } }] },
    sort: '-paidAt',
    limit: 300,
    depth: 0,
    overrideAccess: true,
    select: { donorWall: true },
  })
  return (
    <>
      <PageHeader eyebrow="With gratitude" title="Donor wall" intro="Every name here is a stone in our new Mandir. Thank you." />
      <div className="container-page py-14">
        {docs.length === 0 ? (
          <div className="rounded-3xl border border-ivory-300 bg-white p-10 text-center">
            <p className="font-serif text-2xl">Be the first name on our wall</p>
            <p className="mt-2 text-charcoal-600">Tick “Show my name on the donor wall” when you give.</p>
            <div className="mt-6"><ButtonLink href="/donate">Donate</ButtonLink></div>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {docs.map((d, i) => (
              <li key={i} className="card p-5">
                <p className="font-serif text-xl">{d.donorWall?.displayName}</p>
                {d.donorWall?.message && <p className="mt-1 text-sm text-charcoal-600">{d.donorWall.message}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
