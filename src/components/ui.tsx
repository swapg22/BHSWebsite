import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { EngravedBackdrop, LotusPond, MarigoldToran } from '@/components/temple/Motifs'

type Variant = 'primary' | 'secondary' | 'ghost' | 'light' | 'outline-light' | 'marigold'
type Size = 'md' | 'lg' | 'sm'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-3 text-center'
const variants: Record<Variant, string> = {
  primary: 'btn-festive text-white focus-visible:outline-kumkum-600',
  secondary: 'bg-ivory-50 text-kumkum-800 border border-gold-500/60 hover:border-kumkum-700 hover:bg-kumkum-50',
  ghost: 'text-kumkum-800 hover:bg-kumkum-50',
  light: 'bg-ivory-100 text-charcoal-900 hover:bg-white',
  'outline-light': 'border border-gold-300/80 text-white hover:bg-white/10 hover:border-gold-300',
  marigold: 'bg-marigold-400 text-charcoal-900 hover:bg-marigold-300 shadow-[0_10px_30px_-12px_rgb(242_138_26/0.8)]',
}
const sizes: Record<Size, string> = {
  sm: 'min-h-10 px-4 text-sm',
  md: 'min-h-12 px-6 text-base',
  lg: 'min-h-14 px-8 text-lg',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`
}

export function ButtonLink({ href, variant = 'primary', size = 'md', className = '', children, ...rest }: { href: string; variant?: Variant; size?: Size; className?: string; children: ReactNode } & Omit<ComponentProps<typeof Link>, 'href' | 'className'>) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  )
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: { variant?: Variant; size?: Size } & ComponentProps<'button'>) {
  return (
    <button className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  )
}

export function PageHeader({ eyebrow, title, intro, children }: { eyebrow?: string; title: string; intro?: ReactNode; children?: ReactNode }) {
  return (
    <header className="bg-haldi relative overflow-hidden">
      <EngravedBackdrop className="text-gold-500 opacity-[0.08]" />
      <MandalaBackdrop className="mandala-spin !text-marigold-500/25" />
      <MarigoldToran className="absolute inset-x-0 top-0 h-10 w-full sm:h-14" swags={8} />
      <div className="container-page page-enter relative pb-16 pt-16 sm:pb-24 sm:pt-24">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="max-w-3xl text-4xl text-charcoal-900 sm:text-6xl">{title}</h1>
        {intro && <div className="mt-5 max-w-2xl text-lg text-charcoal-700">{intro}</div>}
        {children && <div className="mt-8">{children}</div>}
      </div>
      <LotusPond className="pointer-events-none absolute inset-x-0 bottom-0 block h-12 w-full text-gold-500/60 sm:h-16" />
    </header>
  )
}

export function Section({ id, className = '', children, tone = 'ivory', labelledBy }: { id?: string; className?: string; children: ReactNode; tone?: 'ivory' | 'white' | 'warm' | 'dark'; labelledBy?: string }) {
  const tones = {
    ivory: 'bg-ivory-100',
    white: 'bg-ivory-50',
    warm: 'bg-ivory-200/70',
    dark: 'bg-charcoal-900 text-ivory-100',
  }
  return (
    <section id={id} aria-labelledby={labelledBy} className={`${tones[tone]} py-16 sm:py-24 ${className}`}>
      <div className="container-page">{children}</div>
    </section>
  )
}

export function SectionHeading({ eyebrow, title, intro, id, align = 'left', light = false }: { eyebrow?: string; title: string; intro?: ReactNode; id?: string; align?: 'left' | 'center'; light?: boolean }) {
  return (
    <div className={`mb-10 max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <p className={`eyebrow mb-3 ${light ? '!text-gold-300' : ''}`}>{eyebrow}</p>}
      <h2 id={id} className={`text-3xl sm:text-5xl ${light ? 'text-ivory-50' : 'text-charcoal-900'}`}>
        {title}
      </h2>
      {intro && <div className={`mt-4 text-lg ${light ? 'text-ivory-200' : 'text-charcoal-600'}`}>{intro}</div>}
    </div>
  )
}

export function Notice({ tone = 'info', title, children }: { tone?: 'info' | 'success' | 'warning' | 'error'; title?: string; children: ReactNode }) {
  const tones = {
    info: 'bg-ivory-50 border-ivory-400 text-charcoal-800',
    success: 'bg-tulsi-50 border-tulsi-300 text-tulsi-900',
    warning: 'bg-kumkum-50 border-kumkum-200 text-kumkum-900',
    error: 'bg-[#fdecec] border-[#f0a3a3] text-[#7f1d1d]',
  }
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-2xl border px-5 py-4 ${tones[tone]}`}>
      {title && <p className="font-semibold">{title}</p>}
      <div className={title ? 'mt-1' : ''}>{children}</div>
    </div>
  )
}

/** Faint lotus mandala used behind page headers; decorative only. */
export function MandalaBackdrop({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 400 400" className={`pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] text-gold-400/25 ${className}`}>
      <g fill="none" stroke="currentColor" strokeWidth="1">
        {Array.from({ length: 16 }).map((_, i) => (
          <ellipse key={i} cx="200" cy="200" rx="40" ry="150" transform={`rotate(${i * 11.25} 200 200)`} />
        ))}
        <circle cx="200" cy="200" r="60" />
        <circle cx="200" cy="200" r="120" />
        <circle cx="200" cy="200" r="180" />
      </g>
    </svg>
  )
}

export function LotusMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M24 6c3.6 5.4 3.6 10.4 0 15-3.6-4.6-3.6-9.6 0-15Zm-10.5 8.8c5.9 1.2 9.3 4.6 10.2 10.2-5.9-1.2-9.3-4.6-10.2-10.2Zm21 0c-.9 5.6-4.3 9-10.2 10.2.9-5.6 4.3-9 10.2-10.2ZM8 26.5c4.8-2.6 10.2-2.4 15.4 1.7-4.8 2.6-10.2 2.4-15.4-1.7Zm32 0c-5.2 4.1-10.6 4.3-15.4 1.7 5.2-4.1 10.6-4.3 15.4-1.7ZM11 33h26c-2.6 5.2-7.4 8-13 8s-10.4-2.8-13-8Z"
      />
    </svg>
  )
}

export function Badge({ children, tone = 'kumkum' }: { children: ReactNode; tone?: 'kumkum' | 'gold' | 'neutral' | 'green' }) {
  const tones = {
    kumkum: 'bg-kumkum-50 text-kumkum-800 border-kumkum-100',
    gold: 'bg-gold-300/30 text-gold-700 border-gold-300',
    neutral: 'bg-ivory-200 text-charcoal-700 border-ivory-300',
    green: 'bg-tulsi-50 text-tulsi-900 border-tulsi-100',
  }
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${tones[tone]}`}>{children}</span>
}

/**
 * Jaali (carved lattice) band used as a quiet section divider (section 17). Decorative only.
 * Drawn as a repeating SVG pattern of interlocking quatrefoils in gold leaf.
 */
export function JaaliBand({ className = '', tone = 'gold' }: { className?: string; tone?: 'gold' | 'light' }) {
  const id = tone === 'gold' ? 'jaali-gold' : 'jaali-light'
  return (
    <svg aria-hidden="true" className={`jaali-band block w-full ${tone === 'light' ? '!text-gold-300/60' : ''} ${className}`} preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="36" height="36" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55">
            <path d="M18 2 C24 10 24 10 34 18 C24 26 24 26 18 34 C12 26 12 26 2 18 C12 10 12 10 18 2Z" />
            <circle cx="18" cy="18" r="3.2" />
            <path d="M0 0 L5 5 M36 0 L31 5 M0 36 L5 31 M36 36 L31 31" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      <line x1="0" y1="35.5" x2="100%" y2="35.5" stroke="currentColor" strokeWidth="1" opacity="0.45" />
    </svg>
  )
}

/** Small diya with a flickering flame, for loading states (motion stops for reduced-motion users). */
export function Diya({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path className="diya-flame" d="M12 2.5c2.2 2.9 2.4 5.2.6 7.1-.4.4-1 .4-1.3 0-1.7-1.9-1.5-4.2.7-7.1Z" fill="#E3A21A" />
      <path d="M3 13.2c2.6.9 5.6 1.4 9 1.4s6.4-.5 9-1.4c-.6 4-4.3 7-9 7s-8.4-3-9-7Z" fill="currentColor" />
      <path d="M8 13.9c1.2.2 2.6.3 4 .3s2.8-.1 4-.3" stroke="#F2D48C" strokeWidth="1" fill="none" />
    </svg>
  )
}
