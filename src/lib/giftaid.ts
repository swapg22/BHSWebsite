/**
 * Gift Aid rules (spec section 6, FR-20).
 *
 * Gift Aid can only be claimed on a donor's own personal money. Event takings,
 * company gifts, bequests and payments that buy something (membership benefits,
 * bookings, sponsorships with a material benefit) are tracked but never marked
 * eligible. The declaration wording below follows HMRC's model declaration and
 * must be approved by the treasurer and administrator before launch.
 */

export const GIFT_AID_DECLARATION_VERSION = '2026-10-v1'

export const GIFT_AID_DECLARATION_TEXT =
  'I want to Gift Aid my donation and any donations I make in the future or have made in the past 4 years to Bharat Hindu Samaj (registered charity 274404). ' +
  'I am a UK taxpayer and understand that if I pay less Income Tax and/or Capital Gains Tax than the amount of Gift Aid claimed on all my donations in that tax year it is my responsibility to pay any difference. ' +
  'I will notify Bharat Hindu Samaj if I want to cancel this declaration, change my name or home address, or no longer pay sufficient tax on my income and/or capital gains.'

export type DonationSource = 'personal' | 'company' | 'event-takings' | 'bequest' | 'sponsorship-with-benefit'

export interface GiftAidCheck {
  source: DonationSource
  declared: boolean
  ukTaxpayer: boolean
  hasHomeAddress: boolean
  hasPostcode: boolean
}

export interface GiftAidDecision {
  eligible: boolean
  reason: string
}

export function decideGiftAid(input: GiftAidCheck): GiftAidDecision {
  if (input.source !== 'personal') {
    return { eligible: false, reason: `Not eligible: ${input.source.replace(/-/g, ' ')} cannot be Gift Aided` }
  }
  if (!input.declared) return { eligible: false, reason: 'No Gift Aid declaration' }
  if (!input.ukTaxpayer) return { eligible: false, reason: 'Donor did not confirm they are a UK taxpayer' }
  if (!input.hasHomeAddress || !input.hasPostcode) {
    return { eligible: false, reason: 'Home address and postcode are required by HMRC' }
  }
  return { eligible: true, reason: 'Eligible personal gift with a valid declaration' }
}

/** Gift Aid adds 25p for every £1 donated (basic rate 20%). */
export function giftAidValue(amountPence: number): number {
  return Math.floor(amountPence * 0.25)
}

export interface HmrcDonationRow {
  title?: string | null
  firstName: string
  lastName: string
  houseNameOrNumber: string
  postcode: string
  isOverseas?: boolean
  donationDate: Date | string
  amountPence: number
  sponsoredEvent?: boolean
}

/** UK postcode normalisation: upper case with a single space before the inward code. */
export function normalisePostcode(raw: string): string {
  const compact = raw.replace(/\s+/g, '').toUpperCase()
  if (compact.length < 5) return compact
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`
}

export function isValidUkPostcode(raw: string): boolean {
  return /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/.test(normalisePostcode(raw))
}

function hmrcDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  const dd = String(date.getUTCDate()).padStart(2, '0')
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const yy = String(date.getUTCFullYear()).slice(-2)
  return `${dd}/${mm}/${yy}`
}

/** HMRC schedule fields only allow a limited character set; strip anything else. */
function hmrcText(value: string, max: number): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 '\-.&]/g, '')
    .trim()
    .slice(0, max)
}

/**
 * Builds rows in the column order of HMRC's Charities Online Gift Aid schedule
 * spreadsheet: Title, First name, Last name, House name or number, Postcode,
 * Aggregated donations, Sponsored event, Donation date, Amount.
 * The treasurer must review the first export before any claim is submitted.
 */
export function buildHmrcScheduleRows(donations: HmrcDonationRow[]): string[][] {
  return donations.map((d) => [
    hmrcText(d.title ?? '', 4),
    hmrcText(d.firstName, 35),
    hmrcText(d.lastName, 35),
    hmrcText(d.houseNameOrNumber, 40),
    d.isOverseas ? 'X' : normalisePostcode(d.postcode),
    '',
    d.sponsoredEvent ? 'Yes' : '',
    hmrcDate(d.donationDate),
    (d.amountPence / 100).toFixed(2),
  ])
}

export const HMRC_SCHEDULE_HEADER = [
  'Title',
  'First name or initial',
  'Last name',
  'House name or number',
  'Postcode',
  'Aggregated donations',
  'Sponsored event',
  'Donation date (DD/MM/YY)',
  'Amount',
]
