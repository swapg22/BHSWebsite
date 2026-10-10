import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/data'
import { sha256 } from '@/lib/signing'
import { issueMemberToken } from '@/lib/session'
import { rateLimit } from '@/lib/rateLimit'

/** Verifies a one-time sign-in link (FR-29). Links expire after 15 minutes and work once. */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const base = process.env.NEXT_PUBLIC_SITE_URL || url.origin
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'local'
  if (!rateLimit(`magic-verify:${ip}`, 20, 15 * 60_000).ok) return NextResponse.redirect(`${base}/account/login?error=link`)
  const token = url.searchParams.get('token') ?? ''
  const nextRaw = url.searchParams.get('next') ?? '/account'
  const next = nextRaw.startsWith('/') && !nextRaw.startsWith('//') ? nextRaw : '/account'
  if (!/^[A-Za-z0-9_-]{40,}$/.test(token)) return NextResponse.redirect(`${base}/account/login?error=link`)

  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'members', where: { magicLinkHash: { equals: sha256(token) } }, limit: 1, overrideAccess: true, showHiddenFields: true })
  const member = docs[0]
  if (!member || !member.magicLinkExpires || new Date(member.magicLinkExpires) < new Date()) {
    return NextResponse.redirect(`${base}/account/login?error=link`)
  }
  await payload.update({ collection: 'members', id: member.id, data: { magicLinkHash: null, magicLinkExpires: null }, overrideAccess: true, context: { skipAudit: true } })
  const { token: jwt, exp } = await issueMemberToken(payload, member.id)
  const res = NextResponse.redirect(`${base}${next}`)
  res.cookies.set(`${payload.config.cookiePrefix}-token`, jwt, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires: new Date(exp * 1000) })
  return res
}
