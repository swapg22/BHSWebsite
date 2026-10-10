import Link from 'next/link'
import { MapPin, Phone, Mail } from 'lucide-react'
import { getSettings, getTimes } from '@/lib/data'
import { LotusMark } from '@/components/ui'
import { NewsletterForm } from '@/components/NewsletterForm'
import { formStartToken } from '@/lib/formGuard'
import { FOOTER_LINKS } from './nav'

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="currentColor">
      <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.3H7.5V14h2.7v8h3.3Z" />
    </svg>
  )
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  )
}
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 5 4.3 1.8.8 2.5.8 3.4.7.6-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  )
}

export async function SiteFooter() {
  const [settings, times] = await Promise.all([getSettings(), getTimes()])
  const year = new Date().getFullYear()
  const social = [
    settings.facebookUrl && { href: settings.facebookUrl, label: 'Facebook', Icon: FacebookIcon },
    settings.instagramUrl && { href: settings.instagramUrl, label: 'Instagram', Icon: InstagramIcon },
    settings.whatsappUrl && { href: settings.whatsappUrl, label: 'WhatsApp', Icon: WhatsAppIcon },
  ].filter(Boolean) as { href: string; label: string; Icon: () => React.JSX.Element }[]

  return (
    <footer className="bg-charcoal-900 text-ivory-200" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>
      <div className="container-page grid gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-saffron-700 text-ivory-50">
              <LotusMark className="h-7 w-7" />
            </span>
            <span className="font-serif text-2xl text-ivory-50">Bharat Hindu Samaj</span>
          </div>
          <address className="mt-6 space-y-3 not-italic">
            <p className="flex gap-3">
              <MapPin aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-gold-400" />
              <span className="whitespace-pre-line">{settings.address}</span>
            </p>
            {settings.phone && (
              <p className="flex gap-3">
                <Phone aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-gold-400" />
                <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:text-white hover:underline">
                  {settings.phone}
                </a>
              </p>
            )}
            {settings.email && (
              <p className="flex gap-3">
                <Mail aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-gold-400" />
                <a href={`mailto:${settings.email}`} className="break-all hover:text-white hover:underline">
                  {settings.email}
                </a>
              </p>
            )}
          </address>
          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-gold-300">Mon–Fri</dt>
            <dd>{times.weekdays}</dd>
            <dt className="text-gold-300">Sat–Sun</dt>
            <dd>{times.weekends}</dd>
            <dt className="text-gold-300">Aarti</dt>
            <dd>Daily at {times.aarti}</dd>
          </dl>
          {settings.mapUrl && (
            <a href={settings.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center rounded-full border border-ivory-200/30 px-5 text-sm font-semibold hover:bg-white/10">
              Get directions<span className="sr-only"> (opens Google Maps)</span>
            </a>
          )}
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
          {FOOTER_LINKS.map((col, i) => (
            <ul key={i} className="space-y-2.5 text-[0.95rem]">
              {col.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-block py-0.5 hover:text-white hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </nav>

        <div className="lg:col-span-3">
          <h3 className="font-serif text-2xl text-ivory-50">Stay in touch</h3>
          <p className="mt-2 text-sm text-ivory-300">Festival dates, community news and appeal updates. No spam, unsubscribe any time.</p>
          <div className="mt-4">
            <NewsletterForm token={formStartToken()} />
          </div>
          {social.length > 0 && (
            <ul className="mt-6 flex gap-3" aria-label="Social media">
              {social.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="grid h-11 w-11 place-items-center rounded-full border border-ivory-200/30 hover:bg-white/10">
                    <Icon />
                    <span className="sr-only">{label} (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-sm text-ivory-300 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Bharat Hindu Samaj. Registered charity in England and Wales, number{' '}
            <a href={`https://register-of-charities.charitycommission.gov.uk/charity-search/-/charity-details/${settings.charityNumber}`} className="underline hover:text-white" target="_blank" rel="noopener noreferrer">
              {settings.charityNumber}
            </a>
            .
          </p>
          <p>{settings.registeredAddress ? `Registered address: ${settings.registeredAddress}` : null}</p>
        </div>
      </div>
    </footer>
  )
}
