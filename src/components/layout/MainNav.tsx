'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'
import type { NavGroup } from './nav'

export function MainNav({ groups, signedIn }: { groups: NavGroup[]; signedIn: boolean }) {
  const [open, setOpen] = useState<string | null>(null)
  const [mobile, setMobile] = useState(false)
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)

  // Close menus when the route changes (adjusting state during render, not in an effect)
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(null)
    setMobile(false)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(null)
        setMobile(false)
      }
    }
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobile ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobile])

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href.split('#')[0]))

  return (
    <>
      <nav ref={navRef} aria-label="Main" className="hidden xl:block">
        <ul className="flex items-center gap-1">
          {groups.map((g) => (
            <li key={g.label} className="relative">
              {g.items ? (
                <>
                  <button
                    type="button"
                    aria-expanded={open === g.label}
                    aria-controls={`menu-${g.label}`}
                    onClick={() => setOpen(open === g.label ? null : g.label)}
                    className={`flex min-h-11 cursor-pointer items-center gap-1 whitespace-nowrap rounded-full px-3 text-[0.95rem] font-medium transition-colors hover:bg-ivory-200 ${isActive(g.href) ? 'text-kumkum-800' : 'text-charcoal-800'}`}
                  >
                    {g.label}
                    <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${open === g.label ? 'rotate-180' : ''}`} />
                  </button>
                  <div
                    id={`menu-${g.label}`}
                    hidden={open !== g.label}
                    className="absolute left-1/2 top-full z-50 mt-2 w-80 -translate-x-1/2 rounded-2xl border border-ivory-300 bg-white p-2 shadow-xl shadow-charcoal-900/10"
                  >
                    <ul>
                      {g.items.map((item) => (
                        <li key={item.href}>
                          <Link href={item.href} className="block rounded-xl px-4 py-3 hover:bg-ivory-100">
                            <span className="block font-semibold text-charcoal-900">{item.label}</span>
                            {item.description && <span className="block text-sm text-charcoal-500">{item.description}</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <Link
                  href={g.href}
                  aria-current={isActive(g.href) ? 'page' : undefined}
                  className={`flex min-h-11 items-center whitespace-nowrap rounded-full px-3 text-[0.95rem] font-medium transition-colors hover:bg-ivory-200 ${isActive(g.href) ? 'text-kumkum-800' : 'text-charcoal-800'}`}
                >
                  {g.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-1.5 xl:hidden">
        <Link href="/membership" className="inline-flex min-h-11 items-center rounded-full border border-gold-500/60 bg-ivory-50 px-3 text-sm font-semibold text-kumkum-800 hover:border-kumkum-700">
          Join
        </Link>
        <Link href="/donate" className="inline-flex min-h-11 items-center rounded-full bg-kumkum-700 px-3.5 text-sm font-semibold text-white hover:bg-kumkum-800">
          Donate
        </Link>
        <button
          type="button"
          onClick={() => setMobile(true)}
          aria-expanded={mobile}
          aria-controls="mobile-menu"
          className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-ivory-400 text-charcoal-800 hover:bg-ivory-200"
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </button>
      </div>

      {mobile && (
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-50 overflow-y-auto bg-ivory-100 xl:hidden">
          <div className="container-page flex h-[4.5rem] items-center justify-between">
            <span className="font-serif text-xl font-semibold">Menu</span>
            <button type="button" onClick={() => setMobile(false)} className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-ivory-400 hover:bg-ivory-200" autoFocus>
              <X aria-hidden="true" className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          <div className="container-page pb-10">
            <div className="mb-6 grid grid-cols-2 gap-3">
              <Link href="/donate" className="flex min-h-12 items-center justify-center rounded-full bg-kumkum-700 font-semibold text-white">
                Donate
              </Link>
              <Link href="/membership" className="flex min-h-12 items-center justify-center rounded-full border border-gold-500/60 bg-ivory-50 font-semibold text-kumkum-800">
                Join
              </Link>
            </div>
            <ul className="divide-y divide-ivory-300 border-y border-ivory-300">
              {groups.map((g) => (
                <li key={g.label} className="py-3">
                  <Link href={g.href} className="block py-2 font-serif text-2xl text-charcoal-900">
                    {g.label}
                  </Link>
                  {g.items && (
                    <ul className="mt-1 grid gap-1 pl-1">
                      {g.items.map((i) => (
                        <li key={i.href}>
                          <Link href={i.href} className="block py-2 text-charcoal-600 hover:text-kumkum-800">
                            {i.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            <Link href="/account" className="mt-6 block py-2 font-semibold text-kumkum-800">
              {signedIn ? 'My account' : 'Member sign in'}
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
