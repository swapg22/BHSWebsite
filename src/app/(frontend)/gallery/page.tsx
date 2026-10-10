import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import type { Media } from '@/payload-types'
import { getPayloadClient, mediaAlt, mediaUrl } from '@/lib/data'
import { PageHeader } from '@/components/ui'

export const metadata: Metadata = { title: 'Photo gallery', description: 'Albums of worship, festivals, community activities and seva at Bharat Hindu Samaj.' }
export const revalidate = 300

export default async function GalleryPage() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'albums', where: { _status: { equals: 'published' } }, sort: '-date', limit: 50, depth: 1 })
  return (
    <>
      <PageHeader eyebrow="Gallery" title="Photo gallery" intro="Moments from Mandir life. People are only named with their consent." />
      <div className="container-page py-14">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((a) => {
            const cover = mediaUrl(a.cover as Media, 'card')
            return (
              <li key={a.id} className="reveal">
                <Link href={`/gallery/${a.slug}`} className="group block overflow-hidden rounded-3xl border border-ivory-300 bg-white">
                  <div className="relative aspect-[4/3] bg-ivory-200">
                    {cover && <Image src={cover} alt={mediaAlt(a.cover as Media)} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />}
                  </div>
                  <div className="p-5">
                    <h2 className="font-serif text-2xl group-hover:text-saffron-800">{a.title}</h2>
                    <p className="text-sm text-charcoal-500">{a.photos?.length ?? 0} photos</p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}
