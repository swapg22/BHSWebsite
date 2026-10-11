import type { CollectionConfig, Where } from 'payload'
import { bookingApprovers, finance, hasRole, isMember, isStaff } from '@/access/roles'
import { withAudit } from '@/hooks/audit'
import { slugField } from '@/fields/slug'
import { readyForReviewField, requireApproverToPublish, trackChangeRequest } from '@/hooks/approval'
import { revalidateAfterChange } from '@/hooks/revalidate'

const DAYS = [
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
  { label: 'Sunday', value: 'sunday' },
]

/**
 * Bookable service catalogue (FR-33). Administrators and the treasurer add, change, pause or
 * remove services; editors can propose changes as drafts. Removing hides a service but keeps
 * its past bookings. Every change is versioned and audited.
 */
export const Services: CollectionConfig = withAudit({
  slug: 'services',
  labels: { singular: 'Bookable service', plural: 'Service catalogue' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'memberPrice', 'nonMemberPrice', 'availability', 'requiresApproval'],
    group: 'Bookings',
    description: 'Poojas, ceremonies, hall hire, classes and lunch club. Set "Availability" to Paused or Removed instead of deleting.',
  },
  // Editors create and edit services and prices as drafts; price changes are "major" and only the
  // administrator publishes them (section 15). Bookings always use the published version.
  access: {
    read: ({ req }): Where | boolean => (isStaff(req.user) ? true : { availability: { equals: 'active' }, _status: { equals: 'published' } }),
    create: ({ req }) => hasRole(req.user, 'administrator', 'editor'),
    update: ({ req }) => hasRole(req.user, 'administrator', 'editor'),
    delete: () => false,
    readVersions: ({ req }) => hasRole(req.user, 'administrator', 'editor', 'treasurer'),
  },
  versions: { drafts: true, maxPerDoc: 50 },
  hooks: {
    beforeChange: [requireApproverToPublish],
    afterChange: [revalidateAfterChange('/services'), trackChangeRequest],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Pooja, seva or ceremony', value: 'pooja' },
        { label: 'Hall and kitchen hire', value: 'hall' },
        { label: 'Class or activity', value: 'class' },
        { label: 'Lunch club and community meals', value: 'meal' },
      ],
    },
    { name: 'summary', type: 'textarea', maxLength: 300 },
    {
      name: 'availability',
      type: 'select',
      defaultValue: 'active',
      required: true,
      options: [
        { label: 'Active (bookable)', value: 'active' },
        { label: 'Paused (hidden for now)', value: 'paused' },
        { label: 'Removed (hidden, records kept)', value: 'removed' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        { name: 'memberPrice', type: 'number', min: 0, required: true, defaultValue: 0, admin: { description: 'Pence. 0 = free.' } },
        { name: 'nonMemberPrice', type: 'number', min: 0, required: true, defaultValue: 0, admin: { description: 'Pence.' } },
        { name: 'materialsPrice', type: 'number', min: 0, admin: { description: 'Optional pooja materials, pence.' } },
      ],
    },
    {
      name: 'priceOnRequest',
      type: 'checkbox',
      defaultValue: false,
      label: 'Price on request',
      admin: { description: 'The office quotes the price when approving the request (set the booking amount before approving).' },
    },
    { name: 'priceUnit', type: 'select', defaultValue: 'each', options: ['each', 'per hour', 'per class', 'per month', 'per term', 'per person'] },
    { name: 'deposit', type: 'number', min: 0, admin: { description: 'Deposit taken at booking (pence), e.g. hall hire.' } },
    { name: 'requiresApproval', type: 'checkbox', defaultValue: true, label: 'Needs approval by treasurer or administrator' },
    { name: 'capacity', type: 'number', min: 0, admin: { description: 'Places per session. Blank = one booking per slot.' } },
    {
      type: 'row',
      fields: [
        { name: 'availableDays', type: 'select', hasMany: true, options: DAYS },
        { name: 'earliestTime', type: 'text', defaultValue: '09:00', admin: { description: 'HH:MM' } },
        { name: 'latestTime', type: 'text', defaultValue: '21:00', admin: { description: 'HH:MM' } },
      ],
    },
    { name: 'defaultDurationMinutes', type: 'number', defaultValue: 120 },
    { name: 'location', type: 'select', defaultValue: 'mandir', options: ['mandir', 'home', 'main-hall', 'sports-hall', 'kitchen', 'either'] },
    {
      name: 'cancellation',
      type: 'group',
      fields: [
        { name: 'fullRefundHours', type: 'number', defaultValue: 72 },
        { name: 'lateRefundPercent', type: 'number', defaultValue: 0, min: 0, max: 100 },
        { name: 'depositRefundable', type: 'checkbox', defaultValue: false },
        { name: 'policyText', type: 'textarea' },
      ],
    },
    { name: 'writesToCalendar', type: 'checkbox', defaultValue: false, label: 'Approved bookings block the master calendar' },
    { name: 'requiresPolicyAgreement', type: 'checkbox', defaultValue: false, label: 'Booker must agree to the hire policy' },
    { name: 'notes', type: 'textarea', admin: { description: 'Shown to bookers, e.g. travel charges.' } },
    { name: 'sortOrder', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
    slugField('name'),
    readyForReviewField,
  ],
})

/** Bookings for events, services and hall hire (FR-15, FR-34 to FR-37). */
export const Bookings: CollectionConfig = withAudit({
  slug: 'bookings',
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'name', 'itemTitle', 'date', 'status', 'amount'],
    group: 'Bookings',
    listSearchableFields: ['reference', 'name', 'email', 'itemTitle'],
    description: 'Approve, reject or cancel requests. Approved hall and ceremony bookings are written to the master calendar.',
  },
  access: {
    read: ({ req }) => {
      if (hasRole(req.user, 'administrator', 'treasurer')) return true
      if (isMember(req.user)) return { member: { equals: req.user!.id } }
      return false
    },
    create: bookingApprovers,
    update: bookingApprovers,
    delete: () => false,
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req, context, operation }) => {
        if (operation !== 'update' || context?.skipBookingHooks) return doc
        const { onBookingStatusChange } = await import('@/lib/bookingService')
        await onBookingStatusChange(req.payload, doc, previousDoc, req)
        return doc
      },
    ],
  },
  fields: [
    { name: 'reference', type: 'text', required: true, unique: true, index: true, admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      required: true,
      index: true,
      defaultValue: 'pending-approval',
      options: [
        { label: 'Pending approval', value: 'pending-approval' },
        { label: 'Awaiting payment', value: 'awaiting-payment' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Waiting list', value: 'waitlisted' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Rejected', value: 'rejected' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'kind', type: 'select', required: true, options: ['event', 'service'], admin: { position: 'sidebar' } },
    { name: 'event', type: 'relationship', relationTo: 'events', admin: { condition: (d) => d?.kind === 'event' } },
    { name: 'service', type: 'relationship', relationTo: 'services', admin: { condition: (d) => d?.kind === 'service' } },
    { name: 'itemTitle', type: 'text', admin: { readOnly: true } },
    { name: 'member', type: 'relationship', relationTo: 'members', index: true },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'date', type: 'date', index: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
        { name: 'startsAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'endsAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
    { name: 'quantity', type: 'number', defaultValue: 1, min: 1 },
    { name: 'includeMaterials', type: 'checkbox', defaultValue: false },
    { name: 'venue', type: 'text' },
    { name: 'blocksVenue', type: 'checkbox', defaultValue: false, admin: { readOnly: true, description: 'Holds the room exclusively (hall hire, ceremonies at the Mandir).' } },
    { name: 'dietaryNotes', type: 'textarea' },
    { name: 'notes', type: 'textarea', label: 'Notes from booker' },
    { name: 'policyAgreedAt', type: 'date', admin: { readOnly: true } },
    {
      type: 'row',
      fields: [
        { name: 'amount', type: 'number', defaultValue: 0, admin: { description: 'Total in pence' } },
        { name: 'deposit', type: 'number', defaultValue: 0, admin: { description: 'Deposit in pence' } },
        { name: 'amountPaid', type: 'number', defaultValue: 0, admin: { description: 'Paid in pence' } },
        { name: 'refunded', type: 'number', defaultValue: 0, admin: { description: 'Refunded in pence' } },
      ],
    },
    { name: 'isMemberPrice', type: 'checkbox', defaultValue: false },
    { name: 'paymentProvider', type: 'text', admin: { readOnly: true } },
    { name: 'paymentId', type: 'text', admin: { readOnly: true } },
    { name: 'staffNote', type: 'textarea', label: 'Note to booker (sent with approval or rejection)' },
    { name: 'attended', type: 'checkbox', defaultValue: false, label: 'Attended (register)' },
    { name: 'googleEventId', type: 'text', hidden: true },
    { name: 'manageToken', type: 'text', hidden: true },
  ],
})

export const FUNDS = [
  { label: 'New Mandir', value: 'new-mandir' },
  { label: 'Daily seva', value: 'daily-seva' },
  { label: 'Food service', value: 'food-service' },
  { label: 'Education', value: 'education' },
  { label: 'Where most needed', value: 'general' },
] as const

/** Donations and Gift Aid records (spec section 6, FR-18 to FR-26). Treasurer and administrator only. */
export const Donations: CollectionConfig = withAudit({
  slug: 'donations',
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'donorName', 'amount', 'fund', 'frequency', 'status', 'giftAidEligible', 'createdAt'],
    group: 'Fundraising',
    listSearchableFields: ['reference', 'donorName', 'email', 'postcode'],
    description: 'Every gift with its Gift Aid declaration. Export for HMRC at /staff/reports.',
  },
  access: {
    read: ({ req }) => {
      if (hasRole(req.user, 'administrator', 'treasurer')) return true
      if (isMember(req.user)) return { member: { equals: req.user!.id } }
      return false
    },
    create: finance,
    update: finance,
    delete: () => false,
  },
  fields: [
    { name: 'reference', type: 'text', required: true, unique: true, index: true, admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      required: true,
      index: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Awaiting bank transfer', value: 'awaiting-transfer' },
        { label: 'Paid', value: 'paid' },
        { label: 'Active (recurring)', value: 'active' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        { name: 'amount', type: 'number', required: true, min: 100, admin: { description: 'Pence' } },
        { name: 'currency', type: 'text', defaultValue: 'GBP' },
        {
          name: 'frequency',
          type: 'select',
          required: true,
          defaultValue: 'one-off',
          options: [
            { label: 'One-off', value: 'one-off' },
            { label: 'Monthly', value: 'monthly' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'method',
          type: 'select',
          required: true,
          options: [
            { label: 'Card / Apple Pay / Google Pay', value: 'card' },
            { label: 'Direct Debit', value: 'direct-debit' },
            { label: 'Bank transfer', value: 'bank-transfer' },
            { label: 'Standing order', value: 'standing-order' },
            { label: 'Cash / cheque (recorded by office)', value: 'offline' },
          ],
        },
        { name: 'fund', type: 'select', required: true, defaultValue: 'new-mandir', options: [...FUNDS] },
      ],
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'personal',
      label: 'Source of funds',
      options: [
        { label: "Donor's own personal money", value: 'personal' },
        { label: 'Company gift', value: 'company' },
        { label: 'Event takings', value: 'event-takings' },
        { label: 'Bequest / legacy', value: 'bequest' },
        { label: 'Sponsorship with a benefit', value: 'sponsorship-with-benefit' },
      ],
      admin: { description: 'Only personal gifts can be Gift Aided.' },
    },
    { name: 'sponsorship', type: 'relationship', relationTo: 'sponsorship-items' },
    { name: 'plaqueName', type: 'text', maxLength: 60 },
    { name: 'campaign', type: 'text', admin: { description: 'Campaign code from a shared link or QR code, e.g. diwali-leaflet.' } },
    { type: 'row', fields: [{ name: 'title', type: 'text' }, { name: 'firstName', type: 'text', required: true }, { name: 'lastName', type: 'text', required: true }] },
    { name: 'donorName', type: 'text', admin: { readOnly: true } },
    { name: 'email', type: 'email', required: true },
    { name: 'company', type: 'text' },
    { type: 'row', fields: [{ name: 'houseNameOrNumber', type: 'text' }, { name: 'addressLine1', type: 'text' }] },
    { type: 'row', fields: [{ name: 'town', type: 'text' }, { name: 'postcode', type: 'text' }, { name: 'country', type: 'text', defaultValue: 'United Kingdom' }] },
    {
      name: 'giftAid',
      type: 'group',
      fields: [
        { name: 'declared', type: 'checkbox', defaultValue: false },
        { name: 'ukTaxpayer', type: 'checkbox', defaultValue: false },
        { name: 'declarationText', type: 'textarea', admin: { readOnly: true } },
        { name: 'declarationVersion', type: 'text', admin: { readOnly: true } },
        { name: 'declaredAt', type: 'date', admin: { readOnly: true } },
        { name: 'claimedInBatch', type: 'text', admin: { description: 'Set when included in an HMRC claim.' } },
      ],
    },
    { name: 'giftAidEligible', type: 'checkbox', defaultValue: false, index: true, admin: { readOnly: true, position: 'sidebar' } },
    { name: 'giftAidReason', type: 'text', admin: { readOnly: true, position: 'sidebar' } },
    {
      name: 'donorWall',
      type: 'group',
      fields: [
        { name: 'consent', type: 'checkbox', defaultValue: false, label: 'Show on donor wall' },
        { name: 'displayName', type: 'text', maxLength: 60 },
        { name: 'message', type: 'textarea', maxLength: 200 },
        { name: 'approved', type: 'checkbox', defaultValue: false, label: 'Approved for display' },
      ],
    },
    { name: 'marketingConsent', type: 'checkbox', defaultValue: false, label: 'Happy to receive appeal updates by email' },
    { name: 'member', type: 'relationship', relationTo: 'members' },
    { name: 'paidAt', type: 'date', admin: { position: 'sidebar' } },
    { name: 'provider', type: 'text', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'providerId', type: 'text', index: true, admin: { readOnly: true, position: 'sidebar' } },
    { name: 'providerSubscriptionId', type: 'text', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'refundedAmount', type: 'number', defaultValue: 0 },
    { name: 'receiptToken', type: 'text', hidden: true },
  ],
  hooks: {
    beforeChange: [
      async ({ data }) => {
        const { decideGiftAid } = await import('@/lib/giftaid')
        data.donorName = [data.firstName, data.lastName].filter(Boolean).join(' ')
        const decision = decideGiftAid({
          source: data.source ?? 'personal',
          declared: Boolean(data.giftAid?.declared),
          ukTaxpayer: Boolean(data.giftAid?.ukTaxpayer),
          hasHomeAddress: Boolean(data.houseNameOrNumber || data.addressLine1),
          hasPostcode: Boolean(data.postcode) || (data.country && data.country !== 'United Kingdom'),
        })
        data.giftAidEligible = decision.eligible
        data.giftAidReason = decision.reason
        return data
      },
    ],
    afterChange: [revalidateAfterChange()],
  },
})

/** Sponsor a brick, pillar, room or day (FR-22). */
export const SponsorshipItems: CollectionConfig = withAudit({
  slug: 'sponsorship-items',
  labels: { singular: 'Sponsorship', plural: 'Sponsorship catalogue' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'type', 'amount', 'totalAvailable', 'sponsoredCount'], group: 'Fundraising' },
  access: { read: () => true, create: finance, update: finance, delete: () => false },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Brick', value: 'brick' },
        { label: 'Pillar', value: 'pillar' },
        { label: 'Room', value: 'room' },
        { label: 'Day', value: 'day' },
      ],
    },
    { name: 'amount', type: 'number', required: true, min: 100, admin: { description: 'Pence' } },
    { name: 'description', type: 'textarea' },
    { name: 'totalAvailable', type: 'number', min: 0, admin: { description: 'Blank = unlimited (e.g. bricks).' } },
    { name: 'sponsoredCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'plaque', type: 'checkbox', defaultValue: true, label: 'Name on plaque offered' },
    { name: 'active', type: 'checkbox', defaultValue: true },
    { name: 'sortOrder', type: 'number', defaultValue: 100 },
  ],
})

/** Major donor pledges (FR-23): not paid online; creates a record for the treasurer and a trustee follow-up. */
export const Pledges: CollectionConfig = withAudit({
  slug: 'pledges',
  admin: { useAsTitle: 'reference', defaultColumns: ['reference', 'name', 'amount', 'plan', 'status', 'assignedTrustee'], group: 'Fundraising' },
  access: { read: finance, create: finance, update: finance, delete: () => false },
  fields: [
    { name: 'reference', type: 'text', required: true, unique: true, admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: ['new', 'contacted', 'agreed', 'in-progress', 'fulfilled', 'withdrawn'],
      admin: { position: 'sidebar' },
    },
    { type: 'row', fields: [{ name: 'name', type: 'text', required: true }, { name: 'email', type: 'email', required: true }, { name: 'phone', type: 'text' }] },
    { name: 'amount', type: 'number', required: true, admin: { description: 'Total pledged, pence' } },
    { name: 'plan', type: 'select', defaultValue: 'single', options: ['single', 'monthly', 'quarterly', 'annual'] },
    { name: 'instalments', type: 'number', defaultValue: 1, min: 1, max: 120 },
    { name: 'startDate', type: 'date' },
    { name: 'dedication', type: 'text', admin: { description: 'In memory of / in honour of' } },
    { name: 'message', type: 'textarea' },
    { name: 'contactPreference', type: 'select', options: ['email', 'phone', 'in-person'], defaultValue: 'phone' },
    { name: 'assignedTrustee', type: 'relationship', relationTo: 'users' },
    {
      name: 'followUps',
      type: 'array',
      fields: [
        { name: 'date', type: 'date', required: true },
        { name: 'by', type: 'text' },
        { name: 'note', type: 'textarea', required: true },
      ],
    },
    { name: 'receivedToDate', type: 'number', defaultValue: 0, admin: { description: 'Pence received so far' } },
  ],
})

/** Membership and booking payments, one row per payment, for receipts and treasurer exports. */
export const Payments: CollectionConfig = withAudit({
  slug: 'payments',
  admin: { useAsTitle: 'receiptNumber', defaultColumns: ['receiptNumber', 'purpose', 'amount', 'status', 'paidAt'], group: 'Fundraising' },
  access: {
    read: ({ req }) => {
      if (hasRole(req.user, 'administrator', 'treasurer')) return true
      if (isMember(req.user)) return { member: { equals: req.user!.id } }
      return false
    },
    create: finance,
    update: finance,
    delete: () => false,
  },
  fields: [
    { name: 'receiptNumber', type: 'text', required: true, unique: true, admin: { readOnly: true } },
    { name: 'purpose', type: 'select', required: true, options: ['membership', 'booking'] },
    { name: 'status', type: 'select', defaultValue: 'pending', options: ['pending', 'paid', 'failed', 'refunded', 'partially-refunded'] },
    { name: 'amount', type: 'number', required: true },
    { name: 'refundedAmount', type: 'number', defaultValue: 0 },
    { name: 'member', type: 'relationship', relationTo: 'members' },
    { name: 'booking', type: 'relationship', relationTo: 'bookings' },
    { name: 'payerName', type: 'text' },
    { name: 'payerEmail', type: 'email' },
    { name: 'description', type: 'text' },
    { name: 'provider', type: 'text' },
    { name: 'providerId', type: 'text', index: true },
    { name: 'paidAt', type: 'date' },
  ],
})

