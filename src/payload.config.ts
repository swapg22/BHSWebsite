import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Members } from './collections/Members'
import { Media } from './collections/Media'
import { Albums, Events, News, Pages } from './collections/Content'
import { Bookings, Donations, Payments, Pledges, Services, SponsorshipItems } from './collections/Commerce'
import { AuditLog, ContactMessages, EmailOutbox, NewsletterSubscribers, Volunteers, VolunteerShifts } from './collections/Community'
import { Appeal, Governance, HomePage, SiteSettings } from './globals'
import { emailAdapter } from './lib/emailAdapter'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (process.env.NODE_ENV === 'production' && (!process.env.PAYLOAD_SECRET || process.env.PAYLOAD_SECRET.length < 32)) {
  throw new Error('PAYLOAD_SECRET must be set to a long random value in production')
}

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL,
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · Bharat Hindu Samaj CMS' },
    components: {
      beforeDashboard: ['@/components/admin/StaffDashboard#StaffDashboard'],
      graphics: {
        Logo: '@/components/admin/Brand#Logo',
        Icon: '@/components/admin/Brand#Icon',
      },
    },
    dateFormat: 'd MMM yyyy, HH:mm',
  },
  collections: [
    Pages,
    Events,
    News,
    Albums,
    Media,
    Services,
    Bookings,
    Donations,
    SponsorshipItems,
    Pledges,
    Payments,
    Members,
    Volunteers,
    VolunteerShifts,
    ContactMessages,
    NewsletterSubscribers,
    Users,
    EmailOutbox,
    AuditLog,
  ],
  globals: [SiteSettings, HomePage, Appeal, Governance],
  editor: lexicalEditor(),
  email: emailAdapter(),
  secret: process.env.PAYLOAD_SECRET || '',
  cors: [process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'],
  csrf: [process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'],
  graphQL: { disable: true },
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  // SQLite for local review; Postgres (e.g. Neon or Supabase) when DATABASE_URL is a postgres:// URL.
  // The schema is pushed automatically in development; production uses migrations (see README).
  db: (process.env.DATABASE_URL ?? '').startsWith('postgres')
    ? postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL }, push: process.env.NODE_ENV !== 'production' })
    : sqliteAdapter({ client: { url: process.env.DATABASE_URL || 'file:./data/bhs.db' }, push: process.env.NODE_ENV !== 'production' }),
  upload: { limits: { fileSize: 15 * 1024 * 1024 } },
  sharp,
  telemetry: false,
  plugins: [],
})
