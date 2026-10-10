import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import type { Media } from '@/payload-types'
import { getGovernance, getPayloadClient, mediaAlt, mediaUrl } from '@/lib/data'
import { PageHeader } from '@/components/ui'
import { PageSections } from '@/components/PageSections'
import { FestivalTable } from '@/components/FestivalTable'
import { CookieSettingsButton } from '@/components/CookieSettingsButton'

export const revalidate = 300

async function getPage(slug: string) {
  const payload = await getPayloadClient()
  const { isEnabled } = await draftMode()
  const res = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1, depth: 2, draft: isEnabled })
  return res.docs[0] ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = await getPage((await params).slug)
  return page ? { title: page.title, description: page.intro ?? undefined } : {}
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!/^[a-z0-9-]+$/.test(slug)) notFound()
  const page = await getPage(slug)
  if (!page) notFound()
  const hero = mediaUrl(page.heroImage as Media, 'hero')
  const governance = slug === 'festival-calendar' ? await getGovernance() : null

  return (
    <>
      <PageHeader eyebrow={page.eyebrow ?? undefined} title={page.title} intro={page.intro} />
      {hero && !(page.heroImage as Media)?.deityImage && (
        <div className="container-page -mt-px">
          <div className="relative -mt-0 aspect-[21/9] overflow-hidden rounded-b-3xl">
            <Image src={hero} alt={mediaAlt(page.heroImage as Media)} fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      )}
      <div className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          {slug === 'festival-calendar' && <FestivalTable pdfUrl={mediaUrl(governance?.festivalCalendarPdf as Media)} />}
          <PageSections sections={page.sections ?? []} />
          {slug === 'cookies' && (
            <div className="mt-8">
              <CookieSettingsButton />
            </div>
          )}
          <p className="mt-16 text-sm text-charcoal-500">
            Last updated {new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(new Date(page.updatedAt))}
          </p>
        </div>
      </div>
    </>
  )
}
