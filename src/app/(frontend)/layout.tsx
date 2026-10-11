import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Mukta, Noto_Sans_Gujarati } from 'next/font/google'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { CookieNotice } from '@/components/layout/CookieNotice'
import { RevealController } from '@/components/layout/RevealController'
import './styles.css'

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-cormorant', display: 'swap' })
// Section 17: a friendly sans-serif for body text and forms. Mukta also covers Devanagari, so Hindi and
// Sanskrit sit in the same weights as English. next/font self-hosts the files (no Google requests at runtime).
const mukta = Mukta({ subsets: ['latin', 'devanagari'], weight: ['300', '400', '500', '600', '700'], variable: '--font-mukta', display: 'swap' })
const gujarati = Noto_Sans_Gujarati({ subsets: ['gujarati'], weight: ['400', '500', '600'], variable: '--font-gujarati', display: 'swap', preload: false })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'Bharat Hindu Samaj — Shree Ram Mandir, Peterborough', template: '%s · Bharat Hindu Samaj' },
  description:
    'Bharat Hindu Samaj is the Hindu temple and community centre in Peterborough, serving the community since 1973. Daily aarti, festivals, classes, bookings and the appeal for our new Mandir. Registered charity 274404.',
  openGraph: { type: 'website', locale: 'en_GB', siteName: 'Bharat Hindu Samaj' },
  icons: { icon: '/icon.svg' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#A31D1D',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${cormorant.variable} ${mukta.variable} ${gujarati.variable}`}>
      <body>
        <a href="#main" className="sr-only z-[100] rounded-full bg-charcoal-900 px-5 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <SiteFooter />
        <CookieNotice />
        <RevealController />
      </body>
    </html>
  )
}
