import { headers } from 'next/headers'
import { createToken, readToken } from '@/lib/signing'
import { rateLimit } from '@/lib/rateLimit'

/**
 * Spam protection for public forms (FR-39) without third-party CAPTCHAs or tracking cookies:
 *  1. a hidden honeypot field that people never fill in,
 *  2. a signed timestamp: forms submitted within 3 seconds of loading are bots,
 *  3. a per-IP rate limit.
 */

export const HONEYPOT_FIELD = 'company_website'
export const TIMESTAMP_FIELD = 'form_started'

export function formStartToken(): string {
  return createToken({ t: Date.now() }, 60 * 60 * 6)
}

export async function clientIp(): Promise<string> {
  const h = await headers()
  return (h.get('x-forwarded-for')?.split(',')[0] ?? h.get('x-real-ip') ?? 'local').trim()
}

export type GuardResult = { ok: true } | { ok: false; error: string }

export async function guardForm(formData: FormData, key: string, limit = 5, windowMs = 10 * 60 * 1000): Promise<GuardResult> {
  if (String(formData.get(HONEYPOT_FIELD) ?? '').trim() !== '') return { ok: false, error: 'Your message could not be sent.' }
  const started = readToken<{ t: number }>(String(formData.get(TIMESTAMP_FIELD) ?? ''))
  if (!started) return { ok: false, error: 'This form has expired. Please refresh the page and try again.' }
  if (Date.now() - started.t < 3000 && process.env.NODE_ENV === 'production') {
    return { ok: false, error: 'Please take a moment to check your details, then submit again.' }
  }
  const rl = rateLimit(`${key}:${await clientIp()}`, limit, windowMs)
  if (!rl.ok) return { ok: false, error: `Too many attempts. Please try again in ${Math.ceil(rl.retryAfterSeconds / 60)} minutes.` }
  return { ok: true }
}

export type FieldErrors = Record<string, string>

export interface FormState {
  ok?: boolean
  message?: string
  errors?: FieldErrors
  values?: Record<string, string>
}

/** Turn zod issues into a map of field name → first message. */
export function zodErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  const out: FieldErrors = {}
  for (const i of issues) {
    const k = String(i.path[0] ?? 'form')
    if (!out[k]) out[k] = i.message
  }
  return out
}

export function formValues(fd: FormData, keys: string[]): Record<string, string> {
  const v: Record<string, string> = {}
  for (const k of keys) {
    const val = fd.get(k)
    if (typeof val === 'string') v[k] = val
  }
  return v
}
