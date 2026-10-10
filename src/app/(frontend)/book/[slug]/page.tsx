import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCurrentMember, getPayloadClient } from '@/lib/data'
import { formatGBP } from '@/lib/money'
import { formStartToken } from '@/lib/formGuard'
import { isActiveMember } from '@/lib/bookingService'
import { SERVICE_CATEGORY_LABELS } from '@/lib/labels'
import { PageHeader } from '@/components/ui'
import { ServiceBookingForm } from './ServiceBookingForm'

async function getService(slug: string) {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'services', where: { and: [{ slug: { equals: slug } }, { availability: { equals: 'active' } }] }, limit: 1, depth: 0 })
  return res.docs[0] ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = await getService((await params).slug)
  return s ? { title: `Book: ${s.name}` } : {}
}

export default async function BookServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const service = await getService((await params).slug)
  if (!service) notFound()
  const member = await getCurrentMember()
  const isMember = isActiveMember(member)
  const minDate = new Date(Date.now() + 864e5).toISOString().slice(0, 10)
  const maxDate = new Date(Date.now() + 365 * 864e5).toISOString().slice(0, 10)

  return (
    <>
      <PageHeader eyebrow={SERVICE_CATEGORY_LABELS[service.category]} title={service.name} intro={service.summary ?? undefined} />
      <div className="container-page grid gap-12 py-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ServiceBookingForm
            token={formStartToken()}
            service={{
              id: service.id,
              name: service.name,
              category: service.category,
              location: service.location ?? 'mandir',
              availableDays: service.availableDays ?? [],
              earliestTime: service.earliestTime ?? '09:00',
              latestTime: service.latestTime ?? '21:00',
              defaultDuration: service.defaultDurationMinutes ?? 120,
              memberPrice: service.memberPrice,
              nonMemberPrice: service.nonMemberPrice,
              materialsPrice: service.materialsPrice ?? 0,
              priceOnRequest: Boolean(service.priceOnRequest),
              perHour: service.priceUnit === 'per hour',
              requiresPolicy: Boolean(service.requiresPolicyAgreement),
              requiresApproval: Boolean(service.requiresApproval),
              capacity: service.capacity ?? null,
            }}
            isMember={isMember}
            minDate={minDate}
            maxDate={maxDate}
            defaults={member ? { name: `${member.firstName} ${member.lastName ?? ''}`.trim(), email: member.email, phone: member.phone ?? '' } : undefined}
          />
        </div>
        <aside className="space-y-5 lg:col-span-5">
          <div className="card p-6">
            <h2 className="font-serif text-2xl">Price</h2>
            {service.priceOnRequest ? (
              <p className="mt-2 text-charcoal-700">The office will confirm the price when approving your request.{service.deposit ? ` A deposit of ${formatGBP(service.deposit)} is payable once approved.` : ''}</p>
            ) : (
              <dl className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-ivory-100 p-4">
                  <dt className="text-sm text-charcoal-500">Members</dt>
                  <dd className="text-xl font-semibold">{service.memberPrice ? formatGBP(service.memberPrice) : 'Free'}</dd>
                </div>
                <div className="rounded-2xl bg-ivory-100 p-4">
                  <dt className="text-sm text-charcoal-500">Non-members</dt>
                  <dd className="text-xl font-semibold">{service.nonMemberPrice ? formatGBP(service.nonMemberPrice) : 'Free'}</dd>
                </div>
              </dl>
            )}
            {service.notes && <p className="mt-4 text-sm text-charcoal-600">{service.notes}</p>}
          </div>
          <div className="card p-6">
            <h2 className="font-serif text-2xl">What happens next</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-charcoal-700">
              {service.requiresApproval ? (
                <>
                  <li>Send your request — it holds the time slot.</li>
                  <li>The office checks the pujari’s and hall availability and approves it.</li>
                  <li>You receive an email to pay online, then a confirmation with a calendar link.</li>
                </>
              ) : (
                <>
                  <li>Reserve your place.</li>
                  <li>You receive a confirmation email straight away.</li>
                </>
              )}
            </ol>
            {service.cancellation?.policyText && <p className="mt-4 text-sm text-charcoal-600">{service.cancellation.policyText}</p>}
          </div>
        </aside>
      </div>
    </>
  )
}
