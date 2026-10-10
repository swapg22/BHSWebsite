import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'light' | 'outline-light'
type Size = 'md' | 'lg' | 'sm'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-3 text-center'
const variants: Record<Variant, string> = {
  primary: 'bg-saffron-700 text-white hover:bg-saffron-800 focus-visible:outline-saffron-600',
  secondary: 'bg-white text-saffron-800 border border-saffron-200 hover:border-saffron-700 hover:bg-saffron-50',
  ghost: 'text-saffron-800 hover:bg-saffron-50',
  light: 'bg-ivory-100 text-charcoal-900 hover:bg-white',
  'outline-light': 'border border-white/70 text-white hover:bg-white/10',
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
    <header className="relative overflow-hidden border-b border-ivory-300 bg-ivory-200/60">
      <MandalaBackdrop />
      <div className="container-page relative py-14 sm:py-20">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="max-w-3xl text-4xl text-charcoal-900 sm:text-6xl">{title}</h1>
        {intro && <div className="mt-5 max-w-2xl text-lg text-charcoal-600">{intro}</div>}
        {children && <div className="mt-8">{children}</div>}
      </div>
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
    success: 'bg-[#ecf7ef] border-[#8cc79c] text-[#14532d]',
    warning: 'bg-saffron-50 border-saffron-200 text-saffron-900',
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

export function Badge({ children, tone = 'saffron' }: { children: ReactNode; tone?: 'saffron' | 'gold' | 'neutral' | 'green' }) {
  const tones = {
    saffron: 'bg-saffron-50 text-saffron-800 border-saffron-100',
    gold: 'bg-gold-300/30 text-gold-700 border-gold-300',
    neutral: 'bg-ivory-200 text-charcoal-700 border-ivory-300',
    green: 'bg-[#ecf7ef] text-[#14532d] border-[#bfe3c8]',
  }
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${tones[tone]}`}>{children}</span>
}
