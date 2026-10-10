export const FUND_LABELS = {
  'new-mandir': 'New Mandir',
  'daily-seva': 'Daily seva',
  'food-service': 'Food service',
  education: 'Education',
  general: 'Where most needed',
} as const

export type FundKey = keyof typeof FUND_LABELS

export const FUND_DESCRIPTIONS: Record<FundKey, string> = {
  'new-mandir': 'Building the new Mandir on our site in Peterborough.',
  'daily-seva': 'Daily aarti, bhog and the upkeep of the Mandir.',
  'food-service': 'Lunch club, community meals and food bank support.',
  education: 'Gujarati and Hindi classes, youth and children’s programmes.',
  general: 'Wherever the trustees see the greatest need.',
}

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  'pending-approval': 'Awaiting approval',
  'awaiting-payment': 'Approved – payment due',
  confirmed: 'Confirmed',
  waitlisted: 'On waiting list',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  rejected: 'Not accepted',
}

export const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  pooja: 'Poojas, sevas and ceremonies',
  hall: 'Hall and kitchen hire',
  class: 'Classes and activities',
  meal: 'Lunch club and community meals',
}

export const SUPPORTED_CURRENCIES = ['GBP', 'USD', 'EUR', 'CAD', 'AUD'] as const
