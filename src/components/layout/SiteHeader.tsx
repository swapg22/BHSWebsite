import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { SiteSetting } from '@/payload-types'
import { getCurrentMember, getSettings, getUpcomingEvents } from '@/lib/data'
import { ButtonLink } from '@/components/ui'
import { MainNav } from './MainNav'
import { NAV } from './nav'

const DAY = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/London' })

/**
 * Two festivals for the banner: the editor's notice while it is in date, then the next festivals
 * on the calendar (skipping one the notice already names).
 */
async function festivalBanner(banner: SiteSetting['festivalBanner']) {
  if (banner?.show === false) return null
  const today = new Date().toISOString().slice(0, 10)
  const notice = banner?.text && (!banner.showUntil || banner.showUntil.slice(0, 10) >= today) ? banner.text : null
  const upcoming = await getUpcomingEvents(3, { category: 'festival' })
  const items = [
    ...(notice ? [notice] : []),
    ...upcoming.filter((e) => !notice?.toLowerCase().includes(e.title.toLowerCase().split(/[ &/]/)[0])).map((e) => `${e.title} · ${DAY.format(new Date(e.startsAt))}`),
  ].slice(0, 2)
  if (!items.length) return null
  return { label: items.length > 1 ? 'Coming festivals' : 'Next festival', items, href: banner?.link || '/events' }
}

function Flower() {
  return (
    <svg viewBox="-12 -12 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, k) => (
        <ellipse key={k} cy="-6" rx="2.6" ry="5" fill={k % 2 ? '#ffa62b' : '#f28a1a'} transform={`rotate(${k * 45})`} />
      ))}
      <circle r="3" fill="#d6246e" />
      <circle r="1.2" fill="#ffe3a3" />
    </svg>
  )
}

/** Greeting and festival banners, and Donate/Join in the header (FR-03). Times are in the footer on every page (FR-02). */
export async function SiteHeader() {
  const [settings, member] = await Promise.all([getSettings(), getCurrentMember()])
  const festival = await festivalBanner(settings.festivalBanner)
  return (
    <>
      {/* Top banner: the greeting, between two flowers (CMS → Site settings → Header banners) */}
      <div className="bg-kumkum-900 text-center text-gold-300">
        <div className="container-page flex items-center justify-center gap-3 py-1.5">
          <Flower />
          {settings.announcementLink ? (
            <Link href={settings.announcementLink} className="font-serif text-lg font-semibold tracking-wide hover:text-marigold-300">
              {settings.announcement || 'Jai Sri Ram'}
            </Link>
          ) : (
            <p className="font-serif text-lg font-semibold tracking-wide">{settings.announcement || 'Jai Sri Ram'}</p>
          )}
          <Flower />
        </div>
      </div>
      {/* Festival banner: an editor's notice, or the next festival from the calendar */}
      {festival && (
        <Link href={festival.href} className="group block border-b border-kumkum-800/30 bg-kumkum-800 text-ivory-50 hover:bg-kumkum-700">
          <span className="container-page flex min-h-10 flex-wrap items-center justify-center gap-x-3 gap-y-0.5 py-1.5 text-center text-[0.95rem]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-marigold-300">
              <Sparkles aria-hidden="true" className="h-4 w-4" /> <span className="sr-only sm:not-sr-only">{festival.label}</span>
            </span>
            {festival.items.map((text, i) => (
              <span key={text} className="inline-flex items-center gap-3">
                {i > 0 && <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-marigold-300" />}
                <span className="underline decoration-gold-400/60 underline-offset-4 group-hover:decoration-marigold-300">{text}</span>
              </span>
            ))}
            <ArrowRight aria-hidden="true" className="hidden h-4 w-4 text-marigold-300 transition-transform group-hover:translate-x-0.5 sm:block" />
          </span>
        </Link>
      )}
      <header className="sticky top-0 z-40 border-b border-ivory-300/80 bg-ivory-100/92 backdrop-blur supports-[backdrop-filter]:bg-ivory-100/80">
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="flex min-h-12 shrink items-center" aria-label="Bharat Hindu Samaj, home">
            <Image src="/images/bhs-logo.png" alt="" width={875} height={105} priority className="h-[26px] w-auto max-w-full sm:h-10 xl:h-11" />
          </Link>
          <MainNav groups={NAV} signedIn={Boolean(member)} />
          <div className="hidden items-center gap-2 xl:flex">
            <Link href="/account" className="min-h-11 whitespace-nowrap rounded-full px-3 py-2.5 text-sm font-semibold text-charcoal-700 hover:bg-ivory-200 hover:text-charcoal-900">
              {member ? 'My account' : 'Sign in'}
            </Link>
            <ButtonLink href="/membership" variant="secondary" size="sm" className="!min-h-11">
              Join
            </ButtonLink>
            <ButtonLink href="/donate" size="sm" className="!min-h-11 px-5">
              Donate
            </ButtonLink>
          </div>
        </div>
      </header>
    </>
  )
}
