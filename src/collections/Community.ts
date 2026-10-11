import type { CollectionConfig } from 'payload'
import { adminOnly, hasRole, staffOnly } from '@/access/roles'
import { withAudit } from '@/hooks/audit'

export const VOLUNTEER_SKILLS = [
  { label: 'Kitchen and cooking', value: 'kitchen' },
  { label: 'Event set-up and stewarding', value: 'events' },
  { label: 'Teaching and youth work', value: 'teaching' },
  { label: 'Seniors and lunch club', value: 'seniors' },
  { label: 'Fundraising', value: 'fundraising' },
  { label: 'Photography and media', value: 'media' },
  { label: 'IT and website', value: 'it' },
  { label: 'Finance and admin', value: 'admin' },
  { label: 'Building, trades and maintenance', value: 'trades' },
  { label: 'First aid', value: 'first-aid' },
]

/** Volunteer signup with skills and availability (FR-38). */
export const Volunteers: CollectionConfig = withAudit({
  slug: 'volunteers',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'email', 'skills', 'status', 'createdAt'], group: 'People' },
  // Personal details: administrator only (editors never see other people's details, section 15)
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { type: 'row', fields: [{ name: 'name', type: 'text', required: true }, { name: 'email', type: 'email', required: true }, { name: 'phone', type: 'text' }] },
    { name: 'skills', type: 'select', hasMany: true, options: VOLUNTEER_SKILLS },
    {
      name: 'availability',
      type: 'select',
      hasMany: true,
      options: ['weekday-mornings', 'weekday-evenings', 'weekends', 'festivals-only', 'remote'],
    },
    { name: 'professionalSkills', type: 'textarea', admin: { description: 'Skills offered for the new Mandir project (architecture, law, finance…).' } },
    { name: 'message', type: 'textarea' },
    { name: 'over18', type: 'checkbox', defaultValue: true },
    { name: 'status', type: 'select', defaultValue: 'new', options: ['new', 'contacted', 'active', 'inactive'], admin: { position: 'sidebar' } },
    { name: 'dbsChecked', type: 'checkbox', label: 'DBS checked (safeguarding)', admin: { position: 'sidebar' } },
  ],
})

/** Shift sign-up for events (FR-38). */
export const VolunteerShifts: CollectionConfig = withAudit({
  slug: 'volunteer-shifts',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'event', 'startsAt', 'slots'], group: 'People' },
  access: { read: () => true, create: staffOnly, update: staffOnly, delete: staffOnly },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'event', type: 'relationship', relationTo: 'events' },
    { type: 'row', fields: [{ name: 'startsAt', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayAndTime' } } }, { name: 'endsAt', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayAndTime' } } }] },
    { name: 'slots', type: 'number', required: true, min: 1, defaultValue: 4 },
    { name: 'description', type: 'textarea' },
    {
      name: 'signups',
      type: 'array',
      access: { read: ({ req }) => hasRole(req.user, 'administrator') },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text' },
      ],
    },
  ],
})

export const CONTACT_TOPICS = [
  { label: 'General enquiry', value: 'general' },
  { label: 'Bookings and hall hire', value: 'bookings' },
  { label: 'Donations and Gift Aid', value: 'donations' },
  { label: 'Membership', value: 'membership' },
  { label: 'Safeguarding concern', value: 'safeguarding' },
] as const

/** Contact form messages, routed to the right inbox (FR-39). */
export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'topic', 'status', 'createdAt'], group: 'People' },
  access: {
    read: ({ req }) => hasRole(req.user, 'administrator', 'treasurer'),
    create: () => false,
    update: ({ req }) => hasRole(req.user, 'administrator', 'treasurer'),
    delete: adminOnly,
  },
  fields: [
    { type: 'row', fields: [{ name: 'name', type: 'text', required: true }, { name: 'email', type: 'email', required: true }, { name: 'phone', type: 'text' }] },
    { name: 'topic', type: 'select', required: true, options: [...CONTACT_TOPICS] },
    { name: 'message', type: 'textarea', required: true },
    { name: 'routedTo', type: 'text', admin: { readOnly: true } },
    { name: 'status', type: 'select', defaultValue: 'new', options: ['new', 'replied', 'closed'], admin: { position: 'sidebar' } },
  ],
}

/** Newsletter list with double opt-in consent records (FR-40, NFR-05 PECR). */
export const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletter-subscribers',
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'status', 'source', 'consentedAt'], group: 'People' },
  access: { read: adminOnly, create: () => false, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true },
    { name: 'name', type: 'text' },
    { name: 'status', type: 'select', defaultValue: 'pending', options: ['pending', 'subscribed', 'unsubscribed'] },
    { name: 'source', type: 'text' },
    { name: 'consentText', type: 'textarea', admin: { readOnly: true } },
    { name: 'consentedAt', type: 'date', admin: { readOnly: true } },
    { name: 'token', type: 'text', hidden: true, index: true },
  ],
}

/** Captured emails when SMTP is not configured, so every journey can be reviewed. */
export const EmailOutbox: CollectionConfig = {
  slug: 'email-outbox',
  labels: { singular: 'Email', plural: 'Email outbox' },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'to', 'createdAt'],
    group: 'Admin',
    description: 'Emails the site would send. Shown here because SMTP is not configured.',
  },
  access: { read: adminOnly, create: () => false, update: () => false, delete: adminOnly },
  fields: [
    { name: 'to', type: 'text', required: true },
    { name: 'subject', type: 'text', required: true },
    { name: 'html', type: 'code', admin: { language: 'html' } },
  ],
}

/** Audit log of who changed what (FR-45). Written by hooks; read-only for the administrator. */
export const AuditLog: CollectionConfig = {
  slug: 'audit-log',
  labels: { singular: 'Audit entry', plural: 'Audit log' },
  admin: {
    useAsTitle: 'summary',
    defaultColumns: ['createdAt', 'actorEmail', 'action', 'entity', 'summary'],
    group: 'Admin',
    listSearchableFields: ['actorEmail', 'entity', 'summary'],
  },
  access: { read: adminOnly, create: () => false, update: () => false, delete: () => false },
  fields: [
    { name: 'actorEmail', type: 'text', index: true },
    { name: 'actorType', type: 'select', options: ['staff', 'member', 'system'] },
    { name: 'action', type: 'text', index: true },
    { name: 'entity', type: 'text', index: true },
    { name: 'entityId', type: 'text' },
    { name: 'summary', type: 'text' },
  ],
}


/**
 * Change requests (section 16 `change_requests`): drafts waiting for approval, who proposed them,
 * whether the change is major, and who approved or declined it. Written by the approval hooks.
 */
export const ChangeRequests: CollectionConfig = {
  slug: 'change-requests',
  labels: { singular: 'Change request', plural: 'Changes awaiting approval' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'entity', 'major', 'status', 'proposedBy', 'proposedAt'],
    group: 'Admin',
    description: 'Drafts editors have marked "Ready for review". Open the item, check it, then publish it — or decline here with a note.',
  },
  access: {
    read: ({ req }) => hasRole(req.user, 'administrator', 'editor'),
    create: () => false,
    update: adminOnly,
    delete: () => false,
  },
  defaultSort: '-proposedAt',
  fields: [
    { name: 'title', type: 'text', required: true, admin: { readOnly: true } },
    { type: 'row', fields: [
      { name: 'entity', type: 'text', required: true, index: true, admin: { readOnly: true, description: 'Content type' } },
      { name: 'entityId', type: 'text', required: true, admin: { readOnly: true } },
      { name: 'kind', type: 'select', options: ['collection', 'global'], admin: { readOnly: true } },
    ] },
    { name: 'major', type: 'checkbox', defaultValue: false, label: 'Major change', admin: { readOnly: true, position: 'sidebar' } },
    {
      name: 'status',
      type: 'select',
      required: true,
      index: true,
      defaultValue: 'awaiting-approval',
      options: [
        { label: 'Awaiting approval', value: 'awaiting-approval' },
        { label: 'Approved and published', value: 'approved' },
        { label: 'Declined', value: 'declined' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'proposedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
    { name: 'proposedAt', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'decidedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
    { name: 'decidedAt', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'note', type: 'textarea', label: 'Note to the editor', admin: { description: 'Why it was declined, or what to change.' } },
    {
      name: 'openItem',
      type: 'ui',
      admin: { components: { Field: '@/components/admin/ChangeRequestLink#ChangeRequestLink' } },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc, req }) => {
        if (originalDoc && data.status === 'declined' && originalDoc.status !== 'declined') {
          data.decidedBy = req.user?.id
          data.decidedAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
}
