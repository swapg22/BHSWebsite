import Link from 'next/link'
import { Clock, Flame } from 'lucide-react'
import { getCurrentMember, getSettings, getTimes } from '@/lib/data'
import { ButtonLink, LotusMark } from '@/components/ui'
import { MainNav } from './MainNav'
import { NAV } from './nav'

/** Opening and aarti times on every page (FR-02) and Donate/Join in the header (FR-03). */
export async function SiteHeader() {
  const [times, settings, member] = await Promise.all([getTimes(), getSettings(), getCurrentMember()])
  return (
    <>
      {settings.announcement && (
        <div className="bg-charcoal-900 text-center text-sm text-ivory-100">
          <div className="container-page py-2">
            {settings.announcementLink ? (
              <Link href={settings.announcementLink} className="underline decoration-gold-400 underline-offset-4 hover:text-white">
                {settings.announcement}
              </Link>
            ) : (
              settings.announcement
            )}
          </div>
        </div>
      )}
      <div className="border-b border-saffron-800/30 bg-saffron-800 text-ivory-50">
        <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2 text-[0.9rem]">
          <p className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <Clock aria-hidden="true" className="h-4 w-4 text-gold-300" />
              <span className="sr-only">Opening times: </span>
              <span>
                <span className="text-gold-300">Mon–Fri</span> {times.weekdays}
              </span>
            </span>
            <span>
              <span className="text-gold-300">Sat–Sun</span> {times.weekends}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Flame aria-hidden="true" className="h-4 w-4 text-gold-300" />
              <span>
                <span className="text-gold-300">Aarti daily</span> {times.aarti}
              </span>
            </span>
          </p>
          {times.overrideLabel && <p className="text-gold-300">{times.overrideLabel} times</p>}
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-ivory-300/80 bg-ivory-100/92 backdrop-blur supports-[backdrop-filter]:bg-ivory-100/80">
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="group flex min-h-12 items-center gap-3" aria-label="Bharat Hindu Samaj, home">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-saffron-700 sm:h-11 sm:w-11 text-ivory-50 transition-colors group-hover:bg-saffron-800">
              <LotusMark className="h-7 w-7" />
            </span>
            <span className="leading-tight">
              <span className="block font-serif whitespace-nowrap text-[1.15rem] font-semibold text-charcoal-900 sm:text-[1.45rem]">Bharat Hindu Samaj</span>
              <span className="hidden text-xs tracking-wide text-charcoal-500 sm:block xl:hidden 2xl:block">Shree Ram Mandir · Peterborough</span>
            </span>
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
