import type { Metadata } from 'next'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { getPayloadClient } from '@/lib/data'
import { PageHeader } from '@/components/ui'

export const metadata: Metadata = { title: 'Search', robots: { index: false } }
export const dynamic = 'force-dynamic'

/** Site search across pages, events, news and services (FR-10). */
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? '').trim().slice(0, 80)
  const payload = await getPayloadClient()
  const results: { href: string; title: string; type: string; text?: string | null }[] = []
  if (q.length >= 2) {
    const like = { like: q }
    const [pages, events, news, services] = await Promise.all([
      payload.find({ collection: 'pages', where: { and: [{ _status: { equals: 'published' } }, { or: [{ title: like }, { intro: like }] }] }, limit: 10, depth: 0 }),
      payload.find({ collection: 'events', where: { and: [{ _status: { equals: 'published' } }, { or: [{ title: like }, { summary: like }] }] }, sort: '-startsAt', limit: 10, depth: 0 }),
      payload.find({ collection: 'news', where: { and: [{ _status: { equals: 'published' } }, { or: [{ title: like }, { excerpt: like }] }] }, limit: 10, depth: 0 }),
      payload.find({ collection: 'services', where: { and: [{ availability: { equals: 'active' } }, { or: [{ name: like }, { summary: like }] }] }, limit: 10, depth: 0 }),
    ])
    pages.docs.forEach((p) => results.push({ href: `/${p.slug}`, title: p.title, type: 'Page', text: p.intro }))
    events.docs.forEach((e) => results.push({ href: `/events/${e.slug}`, title: e.title, type: 'Event', text: e.summary }))
    news.docs.forEach((n) => results.push({ href: `/news/${n.slug}`, title: n.title, type: 'News', text: n.excerpt }))
    services.docs.forEach((s) => results.push({ href: `/book/${s.slug}`, title: s.name, type: 'Service', text: s.summary }))
  }
  return (
    <>
      <PageHeader eyebrow="Search" title="Search the site">
        <form role="search" className="flex max-w-xl gap-2">
          <label htmlFor="q" className="sr-only">Search</label>
          <input id="q" name="q" type="search" defaultValue={q} placeholder="e.g. Diwali, havan, hall hire" className="field-input !rounded-full" />
          <button className="inline-flex min-h-12 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-kumkum-700 px-5 font-semibold text-white hover:bg-kumkum-800"><Search aria-hidden="true" className="h-5 w-5" />Search</button>
        </form>
      </PageHeader>
      <div className="container-page py-12">
        {q.length >= 2 && <p className="mb-6 text-charcoal-600" role="status">{results.length} result{results.length === 1 ? '' : 's'} for “{q}”</p>}
        <ul className="space-y-3">
          {results.map((r) => (
            <li key={r.href} className="card p-5">
              <p className="text-sm font-semibold text-kumkum-700">{r.type}</p>
              <Link href={r.href} className="font-serif text-2xl hover:text-kumkum-800">{r.title}</Link>
              {r.text && <p className="mt-1 line-clamp-2 text-charcoal-600">{r.text}</p>}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
