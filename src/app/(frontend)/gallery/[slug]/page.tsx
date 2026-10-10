import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Media } from '@/payload-types'
import { getPayloadClient, mediaAlt, mediaUrl } from '@/lib/data'
import { PageHeader } from '@/components/ui'
import { ArrowLink } from '@/components/shared'

async function getAlbum(slug: string) {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'albums', where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] }, limit: 1, depth: 2 })
  return res.docs[0] ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = await getAlbum((await params).slug)
  return a ? { title: a.title } : {}
}

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const album = await getAlbum((await params).slug)
  if (!album) notFound()
  return (
    <>
      <PageHeader eyebrow="Gallery" title={album.title} intro={album.description ?? undefined}>
        <ArrowLink href="/gallery">All albums</ArrowLink>
      </PageHeader>
      <div className="container-page py-14">
        <ul className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {(album.photos ?? []).map((p, i) => {
            const m = p.image as Media
            const src = mediaUrl(m, 'card')
            if (!src) return null
            const people = (p.people ?? []).filter((x) => x.consentGiven).map((x) => x.name)
            return (
              <li key={p.id ?? i} className="mb-5 break-inside-avoid">
                <figure className="overflow-hidden rounded-2xl border border-ivory-300 bg-white">
                  <a href={mediaUrl(m) ?? src} target="_blank" rel="noopener noreferrer" className="block">
                    <Image src={src} alt={mediaAlt(m)} width={m.width ?? 960} height={m.height ?? 720} sizes="(min-width: 1024px) 33vw, 100vw" className="h-auto w-full" />
                    <span className="sr-only">Open full-size image in a new tab</span>
                  </a>
                  {(p.caption || people.length > 0 || m.credit) && (
                    <figcaption className="p-4 text-sm text-charcoal-600">
                      {p.caption}
                      {people.length > 0 && <span className="block">With {people.join(', ')}</span>}
                      {m.credit && <span className="block text-charcoal-500">Photo: {m.credit}</span>}
                    </figcaption>
                  )}
                </figure>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}
