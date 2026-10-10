'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Slow fades on scroll (spec section 5). Content is fully visible without JavaScript; this only
 * opts elements into the animation, and does nothing for reduced-motion users.
 */
export function RevealController() {
  const pathname = usePathname()
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.documentElement
    root.classList.add('js-reveal')
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)'))
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    els.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-visible')
      else io.observe(el)
    })

    const parallax = Array.from(document.querySelectorAll<HTMLElement>('.parallax'))
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        for (const el of parallax) {
          const rect = el.parentElement?.getBoundingClientRect()
          if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) continue
          el.style.transform = `translate3d(0, ${(rect.top * -0.12).toFixed(1)}px, 0) scale(1.08)`
        }
      })
    }
    if (parallax.length) {
      window.addEventListener('scroll', onScroll, { passive: true })
      onScroll()
    }
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [pathname])
  return null
}
