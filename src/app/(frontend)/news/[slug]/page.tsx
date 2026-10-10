import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Media } from '@/payload-types'
import { getPayloadClient, mediaAlt, mediaUrl } from '@/lib/data'
import { RichText, ArrowLink } from '@/components/shared'

async function getPost(slug: string) {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'news', where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] }, limit: 1, depth: 1 })
  return res.docs[0] ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const n = await getPost((await params).slug)
  return n ? { title: n.title, description: n.excerpt ?? undefined } : {}
}

export default async function NewsPost({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug)
  if (!post) notFound()
  const cover = mediaUrl(post.cover as Media, 'hero')
  return (
    <article className="container-page py-14">
      <div className="mx-auto max-w-3xl">
        <ArrowLink href="/news">All news</ArrowLink>
        <h1 className="mt-4 text-4xl sm:text-6xl">{post.title}</h1>
        {post.publishedAt && (
          <p className="mt-3 text-charcoal-500">
            <time dateTime={post.publishedAt}>{new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(new Date(post.publishedAt))}</time>
          </p>
        )}
        {cover && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl">
            <Image src={cover} alt={mediaAlt(post.cover as Media)} fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
          </div>
        )}
        <RichText data={post.body} className="mt-10 text-lg" />
      </div>
    </article>
  )
}
