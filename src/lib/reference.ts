import { randomBytes } from 'crypto'

// No 0/O, 1/I/L, so references are easy to read over the phone or type into a bank transfer
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'

export function randomCode(length = 6): string {
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length]
  return out
}

export type ReferenceKind = 'D' | 'M' | 'B' | 'P' | 'R'

/** D = donation, M = membership, B = booking, P = pledge, R = receipt */
export function makeReference(kind: ReferenceKind): string {
  return `BHS-${kind}-${randomCode(6)}`
}

export function isReference(value: string): boolean {
  return /^BHS-[DMBPR]-[2-9A-HJKMNP-Z]{6}$/.test(value)
}
