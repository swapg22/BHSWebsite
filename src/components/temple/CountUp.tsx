'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Counts the numeric part of a statistic up from zero when it scrolls into view ("1,000+",
 * "50 years", "1973"). The final text is rendered on the server, so it is correct without
 * JavaScript and for screen readers; reduced-motion users see it straight away.
 */
export function CountUp({ value, className = '' }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(value)
  useEffect(() => {
    const el = ref.current
    const match = value.match(/^(\D*)([\d,]+)(.*)$/)
    if (!el || !match || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    const [, pre, num, post] = match
    const target = Number(num.replace(/,/g, ''))
    // Years such as 1973 count from a nearby year rather than from zero
    const from = target > 1900 && target < 2100 ? target - 50 : 0
    const fmt = (n: number) => (num.includes(',') ? n.toLocaleString('en-GB') : String(n))
    let raf = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / 1600)
          const eased = 1 - Math.pow(1 - p, 3)
          setDisplay(`${pre}${fmt(Math.round(from + (target - from) * eased))}${post}`)
          if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value])
  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{value}</span>
    </span>
  )
}
