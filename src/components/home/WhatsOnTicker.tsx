import type { HomePage } from '@/payload-types'
import { getUpcomingEvents } from '@/lib/data'
import { TickerTrack, type TickerItem } from './TickerTrack'

const DAY = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/London' })

/** Editors' notices that are in date, followed by the next upcoming events. */
async function tickerItems(ticker: HomePage['ticker']): Promise<TickerItem[]> {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const notices: TickerItem[] = (ticker?.items ?? [])
    .filter((n) => (!n.showFrom || n.showFrom.slice(0, 10) <= today) && (!n.showUntil || n.showUntil.slice(0, 10) >= today))
    .map((n) => ({ label: n.text, href: n.href || undefined }))
  const count = ticker?.eventCount ?? 5
  const events = ticker?.includeEvents === false || count === 0 ? [] : await getUpcomingEvents(count)
  const eventItems: TickerItem[] = events.map((e) => ({
    label: e.title,
    when: new Date(e.startsAt) <= now ? 'On now' : DAY.format(new Date(e.startsAt)),
    href: `/events/${e.slug}`,
  }))
  return [...notices, ...eventItems]
}

/**
 * "What's on" strip under the welcome: editors' notices (CMS → Home page → What's on ticker)
 * followed by the next upcoming events, which update themselves as events are published.
 */
export async function WhatsOnTicker({ ticker }: { ticker: HomePage['ticker'] }) {
  if (ticker?.show === false) return null
  const items = await tickerItems(ticker)
  if (!items.length) return null
  return <TickerTrack items={items} />
}
