import type { Metadata } from 'next'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { getSettings, getTimes } from '@/lib/data'
import { formStartToken } from '@/lib/formGuard'
import { PageHeader } from '@/components/ui'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = { title: 'Contact us', description: 'Address, phone, opening times and a message form for Bharat Hindu Samaj, Peterborough.' }

export default async function ContactPage() {
  const [s, times] = await Promise.all([getSettings(), getTimes()])
  return (
    <>
      <PageHeader eyebrow="Contact" title="Get in touch" intro="Better yet, see us in person — everyone is welcome at the Mandir." />
      <div className="container-page grid gap-12 py-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="mb-6 text-3xl">Send us a message</h2>
          <ContactForm token={formStartToken()} />
        </div>
        <aside className="space-y-5 lg:col-span-5">
          <div className="card space-y-4 p-6">
            <p className="flex gap-3"><MapPin aria-hidden="true" className="mt-1 h-5 w-5 text-kumkum-700" /><span className="whitespace-pre-line">{s.address}</span></p>
            {s.phone && <p className="flex gap-3"><Phone aria-hidden="true" className="mt-1 h-5 w-5 text-kumkum-700" /><a className="underline" href={`tel:${s.phone.replace(/\s/g, '')}`}>{s.phone}</a></p>}
            {s.email && <p className="flex gap-3"><Mail aria-hidden="true" className="mt-1 h-5 w-5 text-kumkum-700" /><a className="break-all underline" href={`mailto:${s.email}`}>{s.email}</a></p>}
            <div className="flex gap-3"><Clock aria-hidden="true" className="mt-1 h-5 w-5 text-kumkum-700" /><p>Weekdays {times.weekdays}<br />Weekends {times.weekends}<br />Daily aarti {times.aarti}</p></div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-ivory-300">
            <iframe title="Map showing Bharat Hindu Samaj, Rock Road, Peterborough" src="https://www.google.com/maps?q=Rock+Road+Peterborough+PE1+3BU&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-72 w-full" />
          </div>
          {s.mapUrl && <a href={s.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-charcoal-400 px-5 font-semibold hover:bg-ivory-200">Get directions<span className="sr-only"> (opens Google Maps)</span></a>}
        </aside>
      </div>
    </>
  )
}
