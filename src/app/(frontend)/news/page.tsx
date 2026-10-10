import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import type { Media } from '@/payload-types'
import { getPayloadClient, mediaAlt, mediaUrl } from '@/lib/data'
import { PageHeader, Badge } from '@/components/ui'

export const metadata: Metadata = { title: 'News', description: 'News and appeal updates from Bharat Hindu Samaj.' }
export const revalidate = 300

const date = (d: string) => new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(new Date(d))

export default async function NewsPage() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'news', where: { _status: { equals: 'published' } }, sort: '-publishedAt', limit: 30, depth: 1 })
  return (
    <>
      <PageHeader eyebrow="News" title="News and appeal updates" />
      <div className="container-page py-14">
        {docs.length === 0 && <p className="text-charcoal-600">No news yet.</p>}
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {docs.map((n) => {
            const cover = mediaUrl(n.cover as Media, 'card')
            return (
              <li key={n.id} className="reveal">
                <article className="card group relative h-full overflow-hidden">
                  <div className="relative aspect-[16/10] bg-ivory-200">{cover && <Image src={cover} alt={mediaAlt(n.cover as Media)} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />}</div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-charcoal-500">
                      {n.category === 'appeal' && <Badge tone="gold">Appeal update</Badge>}
                      {n.publishedAt && <time dateTime={n.publishedAt}>{date(n.publishedAt)}</time>}
                    </div>
                    <h2 className="mt-2 font-serif text-2xl">
                      <Link href={`/news/${n.slug}`} className="after:absolute after:inset-0 group-hover:text-saffron-800">
                        {n.title}
                      </Link>
                    </h2>
                    {n.excerpt && <p className="mt-2 text-charcoal-600">{n.excerpt}</p>}
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}
