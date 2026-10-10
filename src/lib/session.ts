import { cookies } from 'next/headers'
import { addSessionToUser } from 'payload/shared'
import { getFieldsToSign, jwtSign, type Payload, type PayloadRequest } from 'payload'

/** Sets Payload's auth cookie for a member after login, magic link or password reset. */
export async function setAuthCookie(payload: Payload, token: string, expSeconds?: number) {
  const store = await cookies()
  store.set(`${payload.config.cookiePrefix}-token`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    ...(expSeconds ? { expires: new Date(expSeconds * 1000) } : {}),
  })
}

export async function clearAuthCookie(payload: Payload) {
  const store = await cookies()
  store.delete(`${payload.config.cookiePrefix}-token`)
}

/**
 * Issues a session token for a member without a password (one-time sign-in link, FR-29).
 * Mirrors what Payload's own login operation does after the password check.
 */
export async function issueMemberToken(payload: Payload, memberId: number | string): Promise<{ token: string; exp: number }> {
  const collection = payload.collections.members
  const user = await payload.findByID({ collection: 'members', id: memberId, overrideAccess: true, showHiddenFields: true })
  const req = { payload, context: {}, user: null } as unknown as PayloadRequest
  const authUser = { ...user, collection: 'members' as const, _strategy: 'local-jwt' }
  const { sid } = await addSessionToUser({ collectionConfig: collection.config, payload, req, user: authUser as never })
  const fieldsToSign = getFieldsToSign({ collectionConfig: collection.config, email: user.email, sid, user: authUser as never })
  const { token, exp } = await jwtSign({ fieldsToSign, secret: payload.secret, tokenExpiration: collection.config.auth.tokenExpiration })
  return { token, exp }
}
