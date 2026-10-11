'use server'

import { redirect } from 'next/navigation'
import { generateSecret, generateURI, verifySync } from 'otplib'
import QRCode from 'qrcode'
import ExcelJS from 'exceljs'
import { z } from 'zod'
import { getCurrentStaff, getPayloadClient } from '@/lib/data'
import { clientIp, type FormState } from '@/lib/formGuard'
import { rateLimit } from '@/lib/rateLimit'
import { setAuthCookie, clearAuthCookie } from '@/lib/session'
import { hasRole, isStaffAccount } from '@/access/roles'
import { processRows, type ImportReport, type RawRow } from '@/lib/memberImport'

/** Staff login with optional 6-digit code (FR-42). The code is checked in the Users beforeLogin hook. */
export async function staffLogin(_prev: FormState, fd: FormData): Promise<FormState> {
  const rl = rateLimit(`staff-login:${await clientIp()}`, 10, 15 * 60_000)
  if (!rl.ok) return { ok: false, message: 'Too many attempts. Please wait 15 minutes.' }
  const parsed = z.object({ email: z.email(), password: z.string().min(1), totp: z.string().regex(/^\d{6}$/).optional().or(z.literal('')) }).safeParse(Object.fromEntries(fd))
  if (!parsed.success) return { ok: false, message: 'Enter your email and password.', values: { email: String(fd.get('email') ?? '') } }
  const payload = await getPayloadClient()
  try {
    const res = await payload.login({
      collection: 'users',
      data: { email: parsed.data.email.toLowerCase(), password: parsed.data.password },
      req: { data: { totp: parsed.data.totp } } as never,
    })
    if (res.token) await setAuthCookie(payload, res.token, res.exp)
    const user = res.user as { roles?: string[]; twoFactorEnabled?: boolean }
    if (user.roles?.includes('administrator') && !user.twoFactorEnabled) redirect('/staff/2fa')
  } catch (err) {
    if ((err as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT')) throw err
    const msg = (err as Error).message
    return { ok: false, message: /two-factor/i.test(msg) ? msg.replace('Sign in at /staff/login.', 'Enter the 6-digit code from your authenticator app.') : /suspended|locked/i.test(msg) ? msg : 'Email, password or code not recognised.', values: { email: parsed.data.email }, errors: /two-factor/i.test(msg) ? { totp: 'Code required' } : undefined }
  }
  redirect('/admin')
}

export async function staffLogout(): Promise<void> {
  const payload = await getPayloadClient()
  await clearAuthCookie(payload)
  redirect('/staff/login')
}

/** Starts TOTP set-up: stores a pending secret and returns a QR code for the authenticator app. */
export async function beginTwoFactor(): Promise<{ qr: string; secret: string } | { error: string }> {
  const user = await getCurrentStaff()
  if (!user || !isStaffAccount(user)) return { error: 'Please sign in first.' }
  const payload = await getPayloadClient()
  const secret = generateSecret()
  await payload.update({ collection: 'users', id: user.id, data: { twoFactorPendingSecret: secret }, overrideAccess: true, context: { skipAudit: true } })
  const uri = generateURI({ issuer: 'Bharat Hindu Samaj', label: String(user.email), secret })
  return { qr: await QRCode.toDataURL(uri, { margin: 1, width: 240 }), secret }
}

export async function confirmTwoFactor(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await getCurrentStaff()
  if (!user || !isStaffAccount(user)) return { ok: false, message: 'Please sign in first.' }
  const code = String(fd.get('totp') ?? '').replace(/\s/g, '')
  const payload = await getPayloadClient()
  const full = await payload.findByID({ collection: 'users', id: user.id, overrideAccess: true, showHiddenFields: true })
  if (!full.twoFactorPendingSecret) return { ok: false, message: 'Start again: generate a new QR code.' }
  if (!/^\d{6}$/.test(code) || !verifySync({ secret: full.twoFactorPendingSecret, token: code, epochTolerance: 30 }).valid) {
    return { ok: false, message: 'That code did not match. Check the time on your phone and try the latest code.', errors: { totp: 'Code did not match' } }
  }
  await payload.update({
    collection: 'users',
    id: user.id,
    data: { twoFactorSecret: full.twoFactorPendingSecret, twoFactorPendingSecret: null, twoFactorEnabled: true },
    overrideAccess: true,
  })
  return { ok: true, message: 'Two-factor sign-in is now on. From now on, sign in at /staff/login with your 6-digit code.' }
}

/** One-off import of the Excel member list with an error report (FR-31). */
export interface ImportState {
  report?: ImportReport
  created?: number
  message?: string
  dryRun?: boolean
}

export async function importMembers(_prev: ImportState, fd: FormData): Promise<ImportState> {
  const user = await getCurrentStaff()
  if (!user || !hasRole(user, 'administrator')) return { message: 'Only the administrator can import members.' }
  const file = fd.get('file')
  if (!(file instanceof File) || file.size === 0) return { message: 'Choose an Excel (.xlsx) or CSV file.' }
  if (file.size > 5 * 1024 * 1024) return { message: 'The file is larger than 5 MB.' }
  const dryRun = fd.get('mode') !== 'import'

  const rows: RawRow[] = []
  const buf = Buffer.from(await file.arrayBuffer())
  const wb = new ExcelJS.Workbook()
  try {
    if (/\.csv$/i.test(file.name)) {
      const { Readable } = await import('stream')
      await wb.csv.read(Readable.from(buf))
    } else {
      await wb.xlsx.load(buf as unknown as ArrayBuffer)
    }
  } catch {
    return { message: 'Could not read that file. Save it as .xlsx or .csv and try again.' }
  }
  const ws = wb.worksheets[0]
  if (!ws) return { message: 'The file has no worksheet.' }
  const header: string[] = []
  ws.getRow(1).eachCell({ includeEmpty: true }, (c, col) => (header[col] = String(c.text ?? '').trim()))
  ws.eachRow((row, n) => {
    if (n === 1) return
    const obj: RawRow = {}
    header.forEach((h, col) => {
      if (h) obj[h] = row.getCell(col).value as unknown
    })
    rows.push(obj)
  })

  const payload = await getPayloadClient()
  const existing = await payload.find({ collection: 'members', limit: 10000, depth: 0, overrideAccess: true, select: { email: true, membershipNumber: true } })
  const report = processRows(rows, {
    emails: new Set(existing.docs.map((m) => m.email.toLowerCase())),
    numbers: new Set(existing.docs.map((m) => m.membershipNumber).filter(Boolean) as string[]),
  })
  if (dryRun) return { report, dryRun: true }

  let created = 0
  for (const m of report.valid) {
    if (!m.email) continue // members without email are reported and must be added by hand
    const expiry = m.lastPaidDate ? new Date(m.lastPaidDate) : null
    if (expiry) expiry.setUTCFullYear(expiry.getUTCFullYear() + 1)
    await payload.create({
      collection: 'members',
      data: {
        email: m.email,
        password: crypto.randomUUID() + 'Aa1', // members set their own via "email me a link" or reset
        membershipNumber: m.membershipNumber,
        firstName: m.firstName,
        lastName: m.lastName,
        phone: m.phone,
        legacyAddress: m.address,
        postcode: m.postcode,
        receiptNumber: m.receiptNumber,
        memberSince: m.memberSince ?? undefined,
        lastPaidDate: m.lastPaidDate ?? undefined,
        expiryDate: expiry?.toISOString(),
        status: expiry && expiry > new Date() ? 'active' : 'lapsed',
        consents: { newsletter: m.newsletterOptIn },
      },
      overrideAccess: true,
    })
    created++
  }
  return { report, created, message: `Imported ${created} members. Rows with errors or no email were not imported — see the report below.` }
}
