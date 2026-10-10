import type { CollectionConfig, FieldAccess } from 'payload'
import { hasRole, isMember, isStaff } from '@/access/roles'
import { withAudit } from '@/hooks/audit'
import { renderEmail } from '@/lib/email'

const membershipTeamField: FieldAccess = ({ req }) => hasRole(req.user, 'administrator', 'membership-officer', 'treasurer')

/** Fields a member may not change themselves. */
const staffManaged = { update: membershipTeamField, create: membershipTeamField }

/**
 * Member database (spec section 7, FR-27 to FR-31). One record per person.
 * The nine imported Excel fields are kept, plus the fields the website adds.
 */
export const Members: CollectionConfig = withAudit({
  slug: 'members',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['membershipNumber', 'firstName', 'lastName', 'email', 'status', 'expiryDate'],
    group: 'People',
    listSearchableFields: ['membershipNumber', 'firstName', 'lastName', 'email', 'phone', 'postcode'],
    description: 'Member records. Export from the list view; import the Excel list at /staff/import.',
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 14, // 14 days
    maxLoginAttempts: 8,
    lockTime: 15 * 60 * 1000,
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
    forgotPassword: {
      expiration: 60 * 60 * 1000,
      generateEmailSubject: () => 'Reset your Bharat Hindu Samaj password',
      generateEmailHTML: (args) =>
        renderEmail('member-reset', {
          name: (args?.user as { firstName?: string })?.firstName ?? '',
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/account/reset?token=${args?.token}`,
        }).html,
    },
  },
  access: {
    admin: () => false,
    create: ({ req }) => hasRole(req.user, 'administrator', 'membership-officer'),
    read: ({ req }) => {
      if (hasRole(req.user, 'administrator', 'membership-officer', 'treasurer')) return true
      if (isMember(req.user)) return { id: { equals: req.user!.id } }
      return false
    },
    update: ({ req }) => {
      if (hasRole(req.user, 'administrator', 'membership-officer')) return true
      if (isMember(req.user)) return { id: { equals: req.user!.id } }
      return false
    },
    delete: ({ req }) => hasRole(req.user, 'administrator', 'membership-officer'),
    unlock: ({ req }) => hasRole(req.user, 'administrator', 'membership-officer'),
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'membershipNumber', type: 'text', unique: true, index: true, access: staffManaged },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'pending-payment',
          index: true,
          access: staffManaged,
          options: [
            { label: 'Pending payment', value: 'pending-payment' },
            { label: 'Active', value: 'active' },
            { label: 'Lapsed', value: 'lapsed' },
            { label: 'Cancelled', value: 'cancelled' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', required: true, maxLength: 80 },
        { name: 'lastName', type: 'text', maxLength: 80 },
      ],
    },
    { name: 'phone', type: 'text', maxLength: 30 },
    {
      type: 'collapsible',
      label: 'Home address',
      fields: [
        { name: 'addressLine1', type: 'text', maxLength: 120 },
        { name: 'addressLine2', type: 'text', maxLength: 120 },
        { type: 'row', fields: [{ name: 'town', type: 'text', maxLength: 80 }, { name: 'postcode', type: 'text', maxLength: 10 }] },
        { name: 'legacyAddress', type: 'textarea', admin: { description: 'Address as imported from the Excel list.' }, access: staffManaged },
      ],
    },
    {
      type: 'collapsible',
      label: 'Membership and payments',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'memberSince', type: 'date', access: staffManaged, admin: { date: { pickerAppearance: 'dayOnly' } } },
            { name: 'lastPaidDate', type: 'date', access: staffManaged, admin: { date: { pickerAppearance: 'dayOnly' } } },
            { name: 'expiryDate', type: 'date', index: true, access: staffManaged, admin: { date: { pickerAppearance: 'dayOnly' } } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'receiptNumber', type: 'text', access: staffManaged },
            { name: 'paymentReference', type: 'text', access: staffManaged },
          ],
        },
        { name: 'autoRenew', type: 'checkbox', defaultValue: false, label: 'Renew automatically each year' },
        { name: 'over18Confirmed', type: 'checkbox', defaultValue: false, access: staffManaged, label: 'Confirmed aged 18 or over at signup' },
        { name: 'stripeCustomerId', type: 'text', hidden: true },
        { name: 'remindersSent', type: 'json', hidden: true },
      ],
    },
    {
      name: 'giftAid',
      type: 'group',
      label: 'Gift Aid declaration',
      fields: [
        { name: 'declared', type: 'checkbox', defaultValue: false },
        { name: 'declaredAt', type: 'date', access: staffManaged },
        { name: 'declarationVersion', type: 'text', access: staffManaged },
      ],
    },
    {
      name: 'consents',
      type: 'group',
      label: 'Communication consents',
      fields: [
        { name: 'newsletter', type: 'checkbox', defaultValue: false, label: 'Opted for newsletter (email)' },
        { name: 'sms', type: 'checkbox', defaultValue: false, label: 'Text/WhatsApp messages' },
        { name: 'updatedAt', type: 'date', admin: { readOnly: true } },
      ],
    },
    {
      name: 'committeeNotes',
      type: 'textarea',
      label: 'Committee-only notes',
      access: { read: ({ req }) => isStaff(req.user), update: membershipTeamField, create: membershipTeamField },
      admin: { description: 'Never shown to the member.' },
    },
    { name: 'magicLinkHash', type: 'text', hidden: true, index: true },
    { name: 'magicLinkExpires', type: 'date', hidden: true },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        if (data.postcode) data.postcode = String(data.postcode).toUpperCase().trim()
        if (data.email) data.email = String(data.email).toLowerCase().trim()
        const prev = originalDoc?.consents
        const next = data.consents
        if (next && (!prev || prev.newsletter !== next.newsletter || prev.sms !== next.sms)) {
          data.consents = { ...next, updatedAt: new Date().toISOString() }
        }
        return data
      },
    ],
  },
})
