import { createHash, createHmac, timingSafeEqual } from 'crypto'

function secret(): string {
  const s = process.env.APP_SIGNING_SECRET || process.env.PAYLOAD_SECRET
  if (!s) throw new Error('APP_SIGNING_SECRET is not configured')
  return s
}

export function sign(value: string): string {
  return createHmac('sha256', secret()).update(value).digest('base64url')
}

export function verify(value: string, signature: string): boolean {
  const expected = Buffer.from(sign(value))
  const given = Buffer.from(signature)
  return expected.length === given.length && timingSafeEqual(expected, given)
}

/** Signed, expiring token: base64url(payload).signature */
export function createToken(payload: Record<string, unknown>, ttlSeconds: number): string {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds })).toString(
    'base64url',
  )
  return `${body}.${sign(body)}`
}

export function readToken<T extends Record<string, unknown>>(token: string | null | undefined): T | null {
  if (!token || !token.includes('.')) return null
  const [body, sig] = token.split('.')
  if (!verify(body, sig)) return null
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T & { exp: number }
    if (typeof data.exp !== 'number' || data.exp < Math.floor(Date.now() / 1000)) return null
    return data
  } catch {
    return null
  }
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}
