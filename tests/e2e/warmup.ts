/**
 * Compiles every route the journeys visit before the tests start. On a fresh dev server (CI)
 * each first visit triggers a compile that can take longer than a test's timeout.
 */
const ROUTES = [
  '/', '/donate', '/donate/sponsor', '/donate/thank-you', '/membership', '/membership/welcome', '/events',
  '/events/diwali-and-lakshmi-pooja', '/services', '/book/main-hall-hire', '/bookings/confirmed', '/contact',
  '/about', '/account', '/account/login', '/receipt/BHS-D-AAAAAA', '/checkout/demo', '/calendar.ics', '/visit',
  '/availability?date=2026-11-08&venue=main-hall',
]

export default async function warmup() {
  const base = 'http://localhost:3000'
  for (const r of ROUTES) {
    const started = Date.now()
    try {
      await fetch(base + r, { redirect: 'manual', signal: AbortSignal.timeout(180_000) })
    } catch {
      // a slow or failing route is reported by the tests themselves
    }
    if (process.env.CI) console.log(`warmed ${r} in ${Date.now() - started}ms`)
  }
}
