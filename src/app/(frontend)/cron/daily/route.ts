import { timingSafeEqual } from 'crypto'
import { getPayloadClient } from '@/lib/data'
import { purgeTrash, runRenewalReminders } from '@/lib/maintenance'

/** Daily maintenance, called by the host's scheduler with "Authorization: Bearer $CRON_SECRET". */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  const given = (req.headers.get('authorization') ?? '').replace(/^Bearer /, '')
  if (!secret || given.length !== secret.length || !timingSafeEqual(Buffer.from(given), Buffer.from(secret))) {
    return new Response('Unauthorized', { status: 401 })
  }
  const payload = await getPayloadClient()
  const [renewals, trash] = await Promise.all([runRenewalReminders(payload), purgeTrash(payload)])
  return Response.json({ ok: true, ...renewals, ...trash })
}
