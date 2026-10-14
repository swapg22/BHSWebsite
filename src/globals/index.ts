import type { GlobalConfig } from 'payload'
import { adminFieldOnly, adminOnly, contentEditors, hasRole } from '@/access/roles'
import { auditGlobalAfterChange } from '@/hooks/audit'
import { MAJOR_DEFAULTS, readyForReviewField, requireApproverToPublishGlobal, trackGlobalChangeRequest } from '@/hooks/approval'
import { revalidateGlobal } from '@/hooks/revalidate'

const editorialGlobal = {
  read: () => true,
  update: contentEditors,
  readVersions: contentEditors,
  readDrafts: contentEditors,
}

const hooks = {
  beforeChange: [requireApproverToPublishGlobal],
  afterChange: [revalidateGlobal, auditGlobalAfterChange, trackGlobalChangeRequest],
}

const timesFields = [
  { name: 'weekdays', type: 'text' as const },
  { name: 'weekends', type: 'text' as const },
  { name: 'aarti', type: 'text' as const, label: 'Daily aarti' },
  { name: 'note', type: 'text' as const },
]

/** Opening and aarti times, contact details, charity details (FR-02, FR-47). */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings & times',
  admin: { group: 'Settings', description: 'Change opening and aarti times once here; the header, home page and footer all update.' },
  access: editorialGlobal,
  versions: { drafts: true, max: 30 },
  hooks,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Opening & aarti times',
          fields: [
            { name: 'standardTimes', type: 'group', fields: timesFields.map((f) => ({ ...f, required: f.name !== 'note' })) },
            {
              name: 'seasonalOverrides',
              type: 'array',
              admin: { description: 'For festivals or holidays: times shown between the start and end dates.' },
              fields: [
                { name: 'label', type: 'text', required: true },
                { type: 'row', fields: [{ name: 'startDate', type: 'date', required: true }, { name: 'endDate', type: 'date', required: true }] },
                ...timesFields,
              ],
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            { name: 'address', type: 'textarea', required: true },
            { name: 'phone', type: 'text' },
            { name: 'email', type: 'email' },
            { name: 'mapUrl', type: 'text', admin: { description: 'Google Maps link for directions.' } },
            { name: 'parking', type: 'textarea' },
          ],
        },
        {
          label: 'Charity & social',
          fields: [
            { name: 'charityNumber', type: 'text', required: true, defaultValue: '274404' },
            { name: 'registeredAddress', type: 'textarea' },
            { name: 'facebookUrl', type: 'text' },
            { name: 'instagramUrl', type: 'text' },
            { name: 'whatsappUrl', type: 'text' },
            { name: 'announcement', type: 'text', admin: { description: 'Optional short banner at the very top of every page.' } },
            { name: 'announcementLink', type: 'text' },
          ],
        },
        {
          label: 'Bank details',
          description: 'Shown only inside the donate and membership flows, never on plain pages.',
          fields: [
            {
              name: 'bank',
              type: 'group',
              access: { read: () => true, update: ({ req }) => hasRole(req.user, 'administrator', 'treasurer') },
              fields: [
                { name: 'accountName', type: 'text' },
                { name: 'sortCode', type: 'text' },
                { name: 'accountNumber', type: 'text' },
              ],
            },
          ],
        },
      ],
    },
    readyForReviewField,
  ],
}

/** The new Mandir appeal: target, progress, milestones, visuals and the court notice (FR-04, FR-05, FR-49). */
export const Appeal: GlobalConfig = {
  slug: 'appeal',
  label: 'New Mandir appeal',
  admin: { group: 'Settings' },
  access: editorialGlobal,
  versions: { drafts: true, max: 50 },
  hooks,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Progress',
          fields: [
            { type: 'row', fields: [
              { name: 'targetPence', type: 'number', required: true, defaultValue: 120000000, label: 'Target (pence)' },
              { name: 'raisedOfflinePence', type: 'number', defaultValue: 0, label: 'Raised offline / other platforms (pence)', admin: { description: 'Cash, cheques, GoFundMe. Online gifts to the New Mandir fund are added automatically.' } },
            ] },
            { name: 'stageLabel', type: 'text', defaultValue: 'Vision stage', admin: { description: 'Shown until trustees plan a budget and timeline.' } },
            { name: 'buildBudgetPence', type: 'number', admin: { description: 'Leave blank until the trustees have planned it.' } },
            { name: 'timelineText', type: 'text', admin: { description: 'Leave blank until the trustees have planned it.' } },
            {
              name: 'milestones',
              type: 'array',
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'date', type: 'text', admin: { description: 'e.g. "2026" or "Spring 2027"' } },
                { name: 'description', type: 'textarea' },
                { name: 'status', type: 'select', defaultValue: 'upcoming', options: ['done', 'current', 'upcoming'] },
                { name: 'photo', type: 'upload', relationTo: 'media' },
              ],
            },
          ],
        },
        {
          label: 'Why a new Mandir',
          fields: [
            { name: 'trusteesWords', type: 'textarea', admin: { description: "The reason in the trustees' own words." } },
            { name: 'trusteesAttribution', type: 'text', defaultValue: 'The Trustees of Bharat Hindu Samaj' },
            { name: 'chairmanVideoUrl', type: 'text', admin: { description: 'YouTube link. Captions and a transcript are required.' } },
            { name: 'chairmanVideoTranscript', type: 'textarea' },
            {
              name: 'courtNotice',
              type: 'group',
              label: 'High Court case notice',
              admin: { description: 'Shown exactly as on the current site. Only the administrator (on behalf of the trustees) may change it.' },
              access: { update: adminFieldOnly },
              fields: [
                { name: 'show', type: 'checkbox', defaultValue: true },
                { name: 'heading', type: 'text' },
                { name: 'subheading', type: 'text' },
                { name: 'body', type: 'textarea' },
                { name: 'pdf', type: 'upload', relationTo: 'media' },
                { name: 'pdfLabel', type: 'text', defaultValue: 'Download PDF' },
              ],
            },
          ],
        },
        {
          label: 'Vision',
          fields: [
            { name: 'visionIntro', type: 'textarea' },
            {
              name: 'conceptVisuals',
              type: 'array',
              admin: { description: 'Always labelled "artist\'s impression, not final design" on the site.' },
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media' },
                { name: 'caption', type: 'text' },
              ],
            },
            {
              name: 'spaces',
              type: 'array',
              label: 'Named spaces (plan view)',
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'description', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Existing appeal',
          fields: [
            {
              name: 'gofundme',
              type: 'group',
              admin: { description: 'Trustees may remove this later (FR-49).' },
              fields: [
                { name: 'show', type: 'checkbox', defaultValue: true },
                { name: 'heading', type: 'text' },
                { name: 'body', type: 'textarea' },
                { name: 'url', type: 'text' },
                { name: 'qrImage', type: 'upload', relationTo: 'media' },
              ],
            },
          ],
        },
      ],
    },
    readyForReviewField,
  ],
}

/** Home page content that is not driven by other collections. */
export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home page',
  admin: { group: 'Settings' },
  access: editorialGlobal,
  versions: { drafts: true, max: 30 },
  hooks,
  fields: [
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'heroVideoUrl', type: 'text', admin: { description: 'Optional MP4 shown after the page loads on fast connections; stills are shown to reduced-motion users.' } },
    { name: 'heritageLine', type: 'text', defaultValue: 'Serving Peterborough since 1973' },
    { name: 'heroHeading', type: 'text', defaultValue: 'Celebrating 50 years of Bharat Hindu Samaj', admin: { description: 'The welcome line beside the photograph of the deities.' } },
    {
      name: 'ticker',
      type: 'group',
      label: "What's on ticker",
      admin: { description: 'The moving strip under the welcome. Upcoming events are added automatically; add your own notices below (e.g. "Navratri garba every evening, 11–19 October").' },
      fields: [
        { name: 'show', type: 'checkbox', defaultValue: true },
        { type: 'row', fields: [
          { name: 'includeEvents', type: 'checkbox', defaultValue: true, label: 'Include upcoming events' },
          { name: 'eventCount', type: 'number', defaultValue: 5, min: 0, max: 12, label: 'How many events' },
        ] },
        {
          name: 'items',
          type: 'array',
          label: 'Notices',
          maxRows: 12,
          fields: [
            { name: 'text', type: 'text', required: true, maxLength: 120 },
            { name: 'href', type: 'text', label: 'Link (optional)', admin: { description: 'A page on this site, e.g. /events or /donate' } },
            { type: 'row', fields: [
              { name: 'showFrom', type: 'date', admin: { description: 'Optional: first day to show' } },
              { name: 'showUntil', type: 'date', admin: { description: 'Optional: last day to show' } },
            ] },
          ],
        },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      maxRows: 4,
      admin: { description: 'Three or four numbers from real records.' },
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
    },
    {
      name: 'activityCards',
      type: 'array',
      maxRows: 6,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'text', type: 'text' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'href', type: 'text' },
      ],
    },
    {
      name: 'voices',
      type: 'array',
      label: 'Member and devotee messages',
      fields: [
        { name: 'quote', type: 'textarea', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text' },
        { name: 'consent', type: 'checkbox', required: true, label: 'Permission given to publish' },
      ],
    },
    readyForReviewField,
  ],
}

/** Trustees, committee, policies and accounts (FR-47, NFR-06). */
export const Governance: GlobalConfig = {
  slug: 'governance',
  label: 'Trustees, policies & accounts',
  admin: { group: 'Settings' },
  access: editorialGlobal,
  versions: { drafts: true, max: 30 },
  hooks,
  fields: [
    { name: 'trustees', type: 'array', fields: [{ name: 'name', type: 'text', required: true }, { name: 'role', type: 'text' }, { name: 'photo', type: 'upload', relationTo: 'media' }, { name: 'photoConsent', type: 'checkbox' }] },
    { name: 'committee', type: 'array', fields: [{ name: 'name', type: 'text', required: true }, { name: 'role', type: 'text' }, { name: 'photo', type: 'upload', relationTo: 'media' }, { name: 'photoConsent', type: 'checkbox' }] },
    { name: 'committeePhoto', type: 'upload', relationTo: 'media' },
    { name: 'fundsStatement', type: 'textarea', label: 'How funds are held and reported' },
    { name: 'accounts', type: 'array', label: 'Published accounts', fields: [{ name: 'year', type: 'text', required: true }, { name: 'file', type: 'upload', relationTo: 'media' }, { name: 'url', type: 'text', admin: { description: 'Or a link to the Charity Commission register.' } }] },
    { name: 'festivalCalendarPdf', type: 'upload', relationTo: 'media' },
    readyForReviewField,
  ],
}


/** Which changes count as "major" is a setting the administrator maintains (section 15). */
export const ApprovalSettings: GlobalConfig = {
  slug: 'approval-settings',
  label: 'Approval settings',
  admin: { group: 'Admin', description: 'Choose which content types count as major changes. Major changes are flagged first in "Changes awaiting approval".' },
  access: { read: contentEditors, update: adminOnly },
  hooks: { afterChange: [auditGlobalAfterChange] },
  fields: [
    {
      name: 'majorChanges',
      type: 'select',
      hasMany: true,
      defaultValue: MAJOR_DEFAULTS,
      options: [
        { label: 'Home page', value: 'home-page' },
        { label: 'New Mandir appeal (text, figures, case notice, visuals)', value: 'appeal' },
        { label: 'Service catalogue and prices', value: 'services' },
        { label: 'Site settings and times', value: 'site-settings' },
        { label: 'Trustees, policies and accounts', value: 'governance' },
        { label: 'Pages', value: 'pages' },
        { label: 'Events', value: 'events' },
        { label: 'News', value: 'news' },
        { label: 'Photo albums', value: 'albums' },
      ],
    },
  ],
}
