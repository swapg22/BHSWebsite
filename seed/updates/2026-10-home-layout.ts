/**
 * Content update (October 2026, home page re-layout): the larger new Mandir brief (sanctum, prayer
 * hall, 500+ multi-purpose hall, kitchen, dining hall, library, office, car park) and a starter
 * notice for the "What's on" ticker, and the five community picture cards (Worship, Community
 * services, Serving all, Lunch club, Sports and classes), which replace any existing cards. Leaves editors' own ticker notices alone if there are any.
 * Run with `npm run content:layout` (or `npm run supabase content:layout` for production).
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../src/payload.config'
import { NEW_MANDIR_SPACES, TICKER_NOTICES } from '../newMandirSpaces'
import { COMMUNITY_CARDS, SEVA_CARDS } from '../homeCards'

const payload = await getPayload({ config })
const ctx = { skipAudit: true, skipRevalidate: true }
await payload.updateGlobal({ slug: 'appeal', data: { spaces: NEW_MANDIR_SPACES, _status: 'published' }, overrideAccess: true, context: { ...ctx } })
const home = await payload.findGlobal({ slug: 'home-page', depth: 0, overrideAccess: true })
const items = home.ticker?.items?.length ? home.ticker.items : TICKER_NOTICES
const mediaId = async (file: string) =>
  (await payload.find({ collection: 'media', where: { filename: { like: file.replace(/\.jpg$/, '') } }, limit: 1, depth: 0, overrideAccess: true })).docs[0]?.id
const activityCards = []
for (const { file, ...card } of COMMUNITY_CARDS) activityCards.push({ ...card, image: await mediaId(file) })

// The Seva cards move from the home page to the top of the Charity work page
const charity = (await payload.find({ collection: 'pages', where: { slug: { equals: 'charity' } }, limit: 1, depth: 0, overrideAccess: true })).docs[0]
if (charity && !(charity.sections ?? []).some((s) => s.blockType === 'cards')) {
  const items = []
  for (const { file, ...card } of SEVA_CARDS.items) items.push({ ...card, image: await mediaId(file) })
  await payload.update({
    collection: 'pages',
    id: charity.id,
    data: { sections: [{ blockType: 'cards', heading: SEVA_CARDS.heading, intro: SEVA_CARDS.intro, items }, ...(charity.sections ?? [])], _status: 'published' },
    overrideAccess: true,
    context: { ...ctx },
  })
}
await payload.updateGlobal({
  slug: 'home-page',
  data: { activityCards, heroHeading: home.heroHeading || 'Celebrating 50 years of Bharat Hindu Samaj', ticker: { show: true, includeEvents: true, eventCount: 5, ...home.ticker, items }, _status: 'published' },
  overrideAccess: true,
  context: { ...ctx },
})
// Header banners: the greeting at the top, and the festival strip (blank text = next festival automatically)
const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })
if (!settings.festivalBanner?.text || settings.announcement !== 'Jai Sri Ram') {
  await payload.updateGlobal({
    slug: 'site-settings',
    data: { announcement: 'Jai Sri Ram', announcementLink: null, festivalBanner: { show: true, link: '/events', ...settings.festivalBanner }, _status: 'published' },
    overrideAccess: true,
    context: { ...ctx },
  })
}
payload.logger.info(`New Mandir spaces: ${NEW_MANDIR_SPACES.length}; ticker notices: ${items.length}`)
process.exit(0)
