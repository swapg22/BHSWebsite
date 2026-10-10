'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

/**
 * Hero image with an optional film that only loads after the page is interactive, on a
 * connection without data saver, and never for reduced-motion users (spec section 4/5).
 */
export function HeroMedia({ image, alt, videoUrl }: { image: string; alt: string; videoUrl?: string | null }) {
  const [playVideo, setPlayVideo] = useState(false)
  useEffect(() => {
    if (!videoUrl) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    if (reduced || conn?.saveData || (conn?.effectiveType && /2g|3g/.test(conn.effectiveType))) return
    const t = setTimeout(() => setPlayVideo(true), 1200)
    return () => clearTimeout(t)
  }, [videoUrl])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image src={image} alt={alt} fill priority sizes="100vw" className="parallax object-cover will-change-transform" />
      {playVideo && videoUrl && (
        <video className="absolute inset-0 h-full w-full object-cover" src={videoUrl} autoPlay muted loop playsInline aria-hidden="true" />
      )}
    </div>
  )
}
