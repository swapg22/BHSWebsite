import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, ExternalLink } from 'lucide-react'
import type { Media } from '@/payload-types'
import { getGovernance, getSettings, mediaUrl } from '@/lib/data'
import { PageHeader } from '@/components/ui'

export const metadata: Metadata = { title: 'Governance and accounts', description: 'Charity details, trustees, policies and published accounts for Bharat Hindu Samaj (charity 274404).' }
export const revalidate = 300

export default async function GovernancePage() {
  const [g, s] = await Promise.all([getGovernance(), getSettings()])
  return (
    <>
      <PageHeader eyebrow="Trust and transparency" title="Governance and accounts" intro="How Bharat Hindu Samaj is run, and how your gifts are held and reported." />
      <div className="container-page grid gap-10 py-14 lg:grid-cols-3">
        <section className="card p-7" aria-labelledby="charity-h">
          <h2 id="charity-h" className="font-serif text-2xl">
            Charity details
          </h2>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-sm text-charcoal-500">Registered name</dt>
              <dd className="font-semibold">Bharat Hindu Samaj</dd>
            </div>
            <div>
              <dt className="text-sm text-charcoal-500">Registered charity number (England and Wales)</dt>
              <dd className="font-semibold">{s.charityNumber}</dd>
            </div>
            <div>
              <dt className="text-sm text-charcoal-500">Registered address</dt>
              <dd className="font-semibold">{s.registeredAddress}</dd>
            </div>
            <div>
              <dt className="text-sm text-charcoal-500">Founded</dt>
              <dd className="font-semibold">1973 · constitution adopted 15 November 1974</dd>
            </div>
          </dl>
          <a href={`https://register-of-charities.charitycommission.gov.uk/charity-search/-/charity-details/${s.charityNumber}`} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1.5 font-semibold text-saffron-800 underline">
            View on the Charity Commission register <ExternalLink aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </section>
        <section className="card p-7" aria-labelledby="funds-h">
          <h2 id="funds-h" className="font-serif text-2xl">
            How funds are held
          </h2>
          <p className="mt-4 whitespace-pre-line text-charcoal-700">{g.fundsStatement}</p>
          <h3 className="mt-6 font-semibold">Published accounts</h3>
          <ul className="mt-2 space-y-2">
            {(g.accounts ?? []).map((a) => {
              const href = mediaUrl(a.file as Media) ?? a.url
              return href ? (
                <li key={a.year}>
                  <a href={href} className="inline-flex items-center gap-2 text-saffron-800 underline" target={a.url ? '_blank' : undefined} rel="noopener noreferrer">
                    <FileText aria-hidden="true" className="h-4 w-4" /> {a.year}
                  </a>
                </li>
              ) : null
            })}
          </ul>
        </section>
        <section className="card p-7" aria-labelledby="pol-h">
          <h2 id="pol-h" className="font-serif text-2xl">
            Policies
          </h2>
          <ul className="mt-4 space-y-2">
            {[
              ['/privacy', 'Privacy notice'],
              ['/safeguarding', 'Safeguarding'],
              ['/accessibility', 'Accessibility statement'],
              ['/gift-aid', 'Gift Aid'],
              ['/cookies', 'Cookies'],
              ['/hall-hire-terms', 'Hall and kitchen hire policy'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-saffron-800 underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <h3 className="mt-6 font-semibold">Trustees</h3>
          <ul className="mt-2 text-charcoal-700">
            {(g.trustees ?? []).map((t) => (
              <li key={t.name}>{t.name}</li>
            ))}
          </ul>
          <Link href="/committee" className="mt-3 inline-block font-semibold text-saffron-800 underline">
            Committee and trustees
          </Link>
        </section>
      </div>
    </>
  )
}
