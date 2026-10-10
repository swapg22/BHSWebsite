import type { CollectionConfig } from 'payload'
import { contentEditors, publishedOrStaff, adminOnly } from '@/access/roles'
import { withAudit } from '@/hooks/audit'
import { readyForReviewField, requireApproverToPublish } from '@/hooks/approval'
import { slugField } from '@/fields/slug'
import { revalidateAfterChange } from '@/hooks/revalidate'

const editorial = {
  read: publishedOrStaff,
  create: contentEditors,
  update: contentEditors,
  // Deleting moves to the bin (trash); only the administrator can empty it
  delete: contentEditors,
  readVersions: contentEditors,
}

const versions = { drafts: { autosave: false, schedulePublish: true }, maxPerDoc: 50 }

/** Events (FR-11 to FR-15): editors draft, the approver publishes; deleting keeps a 30-day bin. */
export const Events: CollectionConfig = withAudit({
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startsAt', 'category', '_status', 'readyForReview'],
    group: 'Content',
    description: 'Festivals, fundraising events, workshops and regular activities.',
  },
  access: editorial,
  versions,
  trash: true,
  hooks: { beforeChange: [requireApproverToPublish], afterChange: [revalidateAfterChange('/events')] },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 120 },
    {
      type: 'row',
      fields: [
        { name: 'startsAt', type: 'date', required: true, index: true, admin: { date: { pickerAppearance: 'dayAndTime', timeIntervals: 15 } } },
        { name: 'endsAt', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayAndTime', timeIntervals: 15 } } },
      ],
    },
    { name: 'allDay', type: 'checkbox', defaultValue: false },
    {
      name: 'recurrence',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'One-off', value: 'none' },
        { label: 'Daily', value: 'FREQ=DAILY' },
        { label: 'Weekly', value: 'FREQ=WEEKLY' },
        { label: 'Every two weeks', value: 'FREQ=WEEKLY;INTERVAL=2' },
        { label: 'Monthly (same weekday)', value: 'monthly-weekday' },
      ],
      admin: { description: 'Recurring events (daily aarti, weekly classes, lunch club) repeat in the calendar feed.' },
    },
    { name: 'recurrenceUntil', type: 'date', admin: { condition: (d) => d?.recurrence && d.recurrence !== 'none' } },
    { name: 'location', type: 'text', defaultValue: 'BHS Mandir, Unit 6, New England Complex, Rock Road, Peterborough PE1 3BU' },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'festival',
      options: [
        { label: 'Festival', value: 'festival' },
        { label: 'Daily worship', value: 'worship' },
        { label: 'Fundraising', value: 'fundraising' },
        { label: 'Workshop', value: 'workshop' },
        { label: 'Class or activity', value: 'class' },
        { label: 'Community', value: 'community' },
        { label: 'Meeting', value: 'meeting' },
      ],
    },
    { name: 'summary', type: 'textarea', maxLength: 280, admin: { description: 'One or two sentences for cards and the calendar.' } },
    { name: 'description', type: 'richText' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      type: 'collapsible',
      label: 'Booking',
      fields: [
        { name: 'bookable', type: 'checkbox', defaultValue: false, label: 'Take bookings online' },
        {
          type: 'row',
          fields: [
            { name: 'memberPrice', type: 'number', min: 0, defaultValue: 0, admin: { description: 'Pence. 0 = free.', condition: (d) => d?.bookable } },
            { name: 'guestPrice', type: 'number', min: 0, defaultValue: 0, admin: { description: 'Pence. 0 = free.', condition: (d) => d?.bookable } },
            { name: 'capacity', type: 'number', min: 0, admin: { description: 'Blank = unlimited.', condition: (d) => d?.bookable } },
          ],
        },
        { name: 'waitlist', type: 'checkbox', defaultValue: true, label: 'Waiting list when full', admin: { condition: (d) => d?.bookable } },
        {
          name: 'cancellationHours',
          type: 'number',
          defaultValue: 48,
          admin: { condition: (d) => d?.bookable, description: 'Full refund if cancelled at least this many hours before.' },
        },
      ],
    },
    { name: 'showOnCalendar', type: 'checkbox', defaultValue: true, label: 'Show on calendar', admin: { position: 'sidebar' } },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', description: 'Show in the home page events strip.' } },
    { name: 'googleEventId', type: 'text', hidden: true },
    slugField(),
    readyForReviewField,
  ],
})

/** News and appeal updates (FR-44). */
export const News: CollectionConfig = withAudit({
  slug: 'news',
  labels: { singular: 'News post', plural: 'News' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'category', 'publishedAt', '_status', 'readyForReview'], group: 'Content' },
  access: editorial,
  versions,
  trash: true,
  hooks: { beforeChange: [requireApproverToPublish], afterChange: [revalidateAfterChange('/news')] },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 140 },
    {
      name: 'category',
      type: 'select',
      defaultValue: 'news',
      options: [
        { label: 'News', value: 'news' },
        { label: 'New Mandir appeal update', value: 'appeal' },
        { label: 'Community', value: 'community' },
      ],
    },
    { name: 'publishedAt', type: 'date', defaultValue: () => new Date().toISOString(), admin: { position: 'sidebar' } },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'excerpt', type: 'textarea', maxLength: 280 },
    { name: 'body', type: 'richText', required: true },
    slugField(),
    readyForReviewField,
  ],
})

/** Photo albums (FR-07): drag in images, add captions and credits; tagging only with consent. */
export const Albums: CollectionConfig = withAudit({
  slug: 'albums',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'date', '_status', 'readyForReview'], group: 'Content' },
  access: editorial,
  versions,
  trash: true,
  hooks: { beforeChange: [requireApproverToPublish], afterChange: [revalidateAfterChange('/gallery')] },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'date', type: 'date' },
    { name: 'description', type: 'textarea' },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    {
      name: 'photos',
      type: 'array',
      labels: { singular: 'Photo', plural: 'Photos' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
        {
          name: 'people',
          type: 'array',
          label: 'People tagged',
          admin: { description: 'Only tag people who have given consent.' },
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'consentGiven', type: 'checkbox', required: true, label: 'Consent given to be named' },
          ],
          validate: (value: unknown) => {
            const people = (value as { consentGiven?: boolean }[] | null) ?? []
            return people.every((p) => p.consentGiven) || 'Every tagged person must have given consent'
          },
        },
      ],
    },
    slugField(),
    readyForReviewField,
  ],
})

/** Editable pages in set layouts that cannot break the design (spec section 8). */
export const Pages: CollectionConfig = withAudit({
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'readyForReview', 'updatedAt'],
    group: 'Content',
    description: 'Text pages such as About, Daily Rituals, Festivals and policies. Version history keeps every change.',
  },
  access: { ...editorial, delete: adminOnly },
  versions,
  trash: true,
  hooks: { beforeChange: [requireApproverToPublish], afterChange: [revalidateAfterChange()] },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'eyebrow', type: 'text', admin: { description: 'Small heading above the title.' } },
    { name: 'intro', type: 'textarea', maxLength: 400 },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    {
      name: 'sections',
      type: 'blocks',
      blocks: [
        {
          slug: 'text',
          labels: { singular: 'Text', plural: 'Text sections' },
          fields: [
            { name: 'heading', type: 'text' },
            { name: 'body', type: 'richText', required: true },
          ],
        },
        {
          slug: 'imageText',
          labels: { singular: 'Image and text', plural: 'Image and text' },
          fields: [
            { name: 'heading', type: 'text' },
            { name: 'body', type: 'richText', required: true },
            { name: 'image', type: 'upload', relationTo: 'media', required: true },
            { name: 'imageSide', type: 'select', defaultValue: 'right', options: ['left', 'right'] },
          ],
        },
        {
          slug: 'faq',
          labels: { singular: 'Questions and answers', plural: 'Questions and answers' },
          fields: [
            { name: 'heading', type: 'text' },
            {
              name: 'items',
              type: 'array',
              fields: [
                { name: 'question', type: 'text', required: true },
                { name: 'answer', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          slug: 'mantra',
          labels: { singular: 'Mantra or prayer', plural: 'Mantras and prayers' },
          fields: [
            { name: 'heading', type: 'text', required: true },
            { name: 'original', type: 'textarea', admin: { description: 'Devanagari or Gujarati text (optional).' } },
            { name: 'transliteration', type: 'textarea' },
            { name: 'meaning', type: 'textarea' },
          ],
        },
        {
          slug: 'callToAction',
          labels: { singular: 'Call to action', plural: 'Calls to action' },
          fields: [
            { name: 'heading', type: 'text', required: true },
            { name: 'text', type: 'textarea' },
            { name: 'label', type: 'text', required: true },
            { name: 'href', type: 'text', required: true },
          ],
        },
      ],
    },
    slugField(),
    readyForReviewField,
  ],
})
