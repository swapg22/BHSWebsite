'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

/**
 * Cookie notice (NFR-05). The site only uses strictly necessary cookies (sign-in and security),
 * which do not need consent under PECR. Non-essential cookies (e.g. analytics) stay off unless the
 * visitor accepts them; the choice is remembered and can be changed on the Cookies page.
 */
const KEY = 'bhs-cookie-choice'

export function getCookieChoice(): 'accepted' | 'rejected' | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'accepted' || v === 'rejected' ? v : null
  } catch {
    return null
  }
}

export function CookieNotice() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // localStorage only exists in the browser, so the saved choice is read after mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(getCookieChoice() === null)
    const reopen = () => setShow(true)
    window.addEventListener('bhs:cookie-settings', reopen)
    return () => window.removeEventListener('bhs:cookie-settings', reopen)
  }, [])

  const choose = (choice: 'accepted' | 'rejected') => {
    try {
      localStorage.setItem(KEY, choice)
    } catch {
      // storage unavailable: the notice will show again next visit
    }
    window.dispatchEvent(new CustomEvent('bhs:cookie-choice', { detail: choice }))
    setShow(false)
  }

  if (!show) return null
  return (
    <div role="region" aria-label="Cookie choices" className="no-print fixed inset-x-2 bottom-2 z-50 mx-auto max-w-3xl rounded-2xl border border-ivory-300 bg-white p-4 shadow-2xl shadow-charcoal-900/20 sm:inset-x-6 sm:bottom-6 sm:p-5">
      <p className="hidden font-serif text-xl text-charcoal-900 sm:block">Cookies on this site</p>
      <p className="text-sm text-charcoal-600 sm:mt-1 sm:text-[0.95rem]">
        We use essential cookies to keep the site working.<span className="hidden sm:inline"> With your permission we would also like to use optional cookies to understand how the site is used.</span> Change your choice any time on our{' '}
        <Link href="/cookies" className="font-semibold text-kumkum-800 underline">
          cookies page
        </Link>
        .
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:flex">
        <button type="button" onClick={() => choose('rejected')} className="min-h-11 cursor-pointer rounded-full bg-charcoal-900 px-3 text-sm font-semibold text-white hover:bg-charcoal-700 sm:min-h-12 sm:px-6 sm:text-base">
          Essential only
        </button>
        <button type="button" onClick={() => choose('accepted')} className="min-h-11 cursor-pointer rounded-full border border-charcoal-400 px-3 text-sm font-semibold text-charcoal-900 hover:bg-ivory-100 sm:min-h-12 sm:px-6 sm:text-base">
          Accept optional
        </button>
      </div>
    </div>
  )
}
