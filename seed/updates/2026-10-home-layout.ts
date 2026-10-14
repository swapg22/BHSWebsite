/**
 * Content update (October 2026, home page re-layout): the larger new Mandir brief (sanctum, prayer
 * hall, 500+ multi-purpose hall, kitchen, dining hall, library, office, car park) and a starter
 * notice for the "What's on" ticker. Leaves editors' own ticker notices alone if there are any.
 * Run with `npm run content:layout` (or `npm run supabase content:layout` for production).
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../src/payload.config'
import { NEW_MANDIR_SPACES, TICKER_NOTICES } from '../newMandirSpaces'

const payload = await getPayload({ config })
const ctx = { skipAudit: true, skipRevalidate: true }
await payload.updateGlobal({ slug: 'appeal', data: { spaces: NEW_MANDIR_SPACES, _status: 'published' }, overrideAccess: true, context: { ...ctx } })
const home = await payload.findGlobal({ slug: 'home-page', depth: 0, overrideAccess: true })
const items = home.ticker?.items?.length ? home.ticker.items : TICKER_NOTICES
await payload.updateGlobal({
  slug: 'home-page',
  data: { heroHeading: home.heroHeading || 'Celebrating 50 years of Bharat Hindu Samaj', ticker: { show: true, includeEvents: true, eventCount: 5, ...home.ticker, items }, _status: 'published' },
  overrideAccess: true,
  context: { ...ctx },
})
payload.logger.info(`New Mandir spaces: ${NEW_MANDIR_SPACES.length}; ticker notices: ${items.length}`)
process.exit(0)
