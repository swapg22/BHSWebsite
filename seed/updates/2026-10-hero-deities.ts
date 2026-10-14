/**
 * Content update (October 2026): the home page opens with darshan of the murtis inside the Mandir,
 * as on the current site. Points the home page hero at the Ram Darbar photograph and publishes it.
 * Safe to re-run. Run locally with `npx tsx seed/updates/2026-10-hero-deities.ts`, or against
 * production with `npm run supabase content:hero`.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../src/payload.config'

const payload = await getPayload({ config })
const found = await payload.find({ collection: 'media', where: { filename: { like: 'ram-darbar' } }, limit: 1, depth: 0, overrideAccess: true })
const image = found.docs[0]
if (!image) throw new Error('The Ram Darbar photograph is not in the media library')
if (!image.deityImage) await payload.update({ collection: 'media', id: image.id, data: { deityImage: true }, overrideAccess: true, context: { skipAudit: true } })
await payload.updateGlobal({
  slug: 'home-page',
  data: { heroImage: image.id, _status: 'published' },
  overrideAccess: true,
  context: { skipAudit: true, skipRevalidate: true },
})
payload.logger.info(`Home page hero set to media ${image.id} (${image.filename})`)
process.exit(0)
