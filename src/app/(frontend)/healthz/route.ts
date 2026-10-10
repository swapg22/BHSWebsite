import { getPayloadClient } from '@/lib/data'

/** Uptime monitoring endpoint (NFR-07): checks the app and the database. */
export async function GET() {
  try {
    const payload = await getPayloadClient()
    await payload.count({ collection: 'events', overrideAccess: true })
    return Response.json({ ok: true, time: new Date().toISOString() }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ ok: false }, { status: 503 })
  }
}
