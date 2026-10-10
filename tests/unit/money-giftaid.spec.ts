import { describe, expect, it } from 'vitest'
import { formatGBP, parseAmountToPence, percentOf } from '@/lib/money'
import {
  buildHmrcScheduleRows,
  decideGiftAid,
  giftAidValue,
  isValidUkPostcode,
  normalisePostcode,
} from '@/lib/giftaid'
import { toCSV } from '@/lib/csv'

describe('money', () => {
  it('parses typed amounts into pence', () => {
    expect(parseAmountToPence('25')).toBe(2500)
    expect(parseAmountToPence('£1,000.5')).toBe(100050)
    expect(parseAmountToPence('10.05')).toBe(1005)
    expect(parseAmountToPence('abc')).toBeNull()
    expect(parseAmountToPence('10.123')).toBeNull()
    expect(parseAmountToPence('-5')).toBeNull()
  })
  it('formats GBP', () => {
    expect(formatGBP(2000)).toBe('£20')
    expect(formatGBP(120000000)).toBe('£1,200,000')
    expect(formatGBP(1050)).toBe('£10.50')
  })
  it('clamps percentages', () => {
    expect(percentOf(50, 200)).toBe(25)
    expect(percentOf(500, 200)).toBe(100)
    expect(percentOf(5, 0)).toBe(0)
  })
})

describe('gift aid', () => {
  const ok = { source: 'personal' as const, declared: true, ukTaxpayer: true, hasHomeAddress: true, hasPostcode: true }
  it('accepts personal gifts with a full declaration', () => {
    expect(decideGiftAid(ok).eligible).toBe(true)
  })
  it.each(['company', 'event-takings', 'bequest', 'sponsorship-with-benefit'] as const)('never marks %s eligible', (source) => {
    expect(decideGiftAid({ ...ok, source }).eligible).toBe(false)
  })
  it('requires declaration, taxpayer status and address', () => {
    expect(decideGiftAid({ ...ok, declared: false }).eligible).toBe(false)
    expect(decideGiftAid({ ...ok, ukTaxpayer: false }).eligible).toBe(false)
    expect(decideGiftAid({ ...ok, hasPostcode: false }).eligible).toBe(false)
  })
  it('adds 25%', () => {
    expect(giftAidValue(1000)).toBe(250)
    expect(giftAidValue(333)).toBe(83)
  })
  it('normalises and validates postcodes', () => {
    expect(normalisePostcode('pe13bu')).toBe('PE1 3BU')
    expect(isValidUkPostcode('PE1 3BU')).toBe(true)
    expect(isValidUkPostcode('SW1A1AA')).toBe(true)
    expect(isValidUkPostcode('12345')).toBe(false)
  })
  it('builds HMRC schedule rows in the expected format', () => {
    const rows = buildHmrcScheduleRows([
      { title: 'Mrs', firstName: 'Priyá', lastName: "O'Neil-Patel", houseNameOrNumber: '6', postcode: 'pe1 3bu', donationDate: '2026-10-09T10:00:00Z', amountPence: 2550 },
      { firstName: 'A', lastName: 'Donor', houseNameOrNumber: '1 Rue', postcode: '', isOverseas: true, donationDate: new Date(Date.UTC(2026, 0, 5)), amountPence: 1000 },
    ])
    expect(rows[0]).toEqual(['Mrs', 'Priya', "O'Neil-Patel", '6', 'PE1 3BU', '', '', '09/10/26', '25.50'])
    expect(rows[1][4]).toBe('X')
    expect(rows[1][7]).toBe('05/01/26')
  })
})

describe('csv', () => {
  it('escapes quotes, commas and formula injection', () => {
    const csv = toCSV([['a,b', 'say "hi"', '=SUM(A1)', -5, '-12.5']], ['x', 'y', 'z', 'n', 'm'])
    expect(csv).toBe('x,y,z,n,m\r\n"a,b","say ""hi""",\'=SUM(A1),-5,-12.5\r\n')
  })
})
