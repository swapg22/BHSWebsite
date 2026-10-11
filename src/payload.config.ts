import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import fs from 'fs'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { s3Storage } from '@payloadcms/storage-s3'

import { Users } from './collections/Users'
import { Members } from './collections/Members'
import { Media } from './collections/Media'
import { Albums, Events, News, Pages } from './collections/Content'
import { Bookings, Donations, Payments, Pledges, Services, SponsorshipItems } from './collections/Commerce'
import { AuditLog, ChangeRequests, ContactMessages, EmailOutbox, NewsletterSubscribers, Volunteers, VolunteerShifts } from './collections/Community'
import { Appeal, ApprovalSettings, Governance, HomePage, SiteSettings } from './globals'
import { emailAdapter } from './lib/emailAdapter'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const isPostgres = (process.env.DATABASE_URL ?? '').startsWith('postgres')

// On Vercel, fall back to the deployment's own address until the real domain is configured
if (!process.env.NEXT_PUBLIC_SITE_URL && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
  process.env.NEXT_PUBLIC_SITE_URL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
}

// SQLite needs its folder to exist (data/ is git-ignored, so a fresh checkout or CI has none)
if (!isPostgres) {
  const file = (process.env.DATABASE_URL || 'file:./data/bhs.db').replace(/^file:/, '')
  if (file && file !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true })
}

function allowedOrigins(): string[] {
  const list = [process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000']
  for (const host of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]) {
    if (host) list.push(`https://${host}`)
  }
  return [...new Set(list)]
}

/** Encrypted connections (section 16). Set DATABASE_CA to Supabase's CA certificate to also verify the server. */
function dbSsl() {
  const url = process.env.DATABASE_URL ?? ''
  if (/@(localhost|127\.0\.0\.1)[:/]|sslmode=disable/.test(url)) return false
  if (process.env.DATABASE_CA) return { ca: process.env.DATABASE_CA.replace(/\\n/g, '\n'), rejectUnauthorized: true }
  return { rejectUnauthorized: false }
}

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
    ChangeRequests,
    EmailOutbox,
    AuditLog,
  ],
  globals: [SiteSettings, HomePage, Appeal, Governance, ApprovalSettings],
  editor: lexicalEditor(),
  email: emailAdapter(),
  secret: process.env.PAYLOAD_SECRET || '',
  // Allowed origins: the site address, plus Vercel preview addresses for this deployment
  cors: allowedOrigins(),
  csrf: allowedOrigins(),
  graphQL: { disable: true },
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  // Production database (section 16, FR-53): managed PostgreSQL on Supabase. The schema is changed
  // only through committed migrations (src/migrations), never pushed, so every change is reviewed.
  // SQLite remains for quick local review and the test suite.
  db: isPostgres
    ? postgresAdapter({
        pool: { connectionString: process.env.DATABASE_URL, ssl: dbSsl(), max: Number(process.env.DATABASE_POOL_MAX || 5) },
        push: false,
        migrationDir: path.resolve(dirname, 'migrations'),
      })
    : sqliteAdapter({ client: { url: process.env.DATABASE_URL || 'file:./data/bhs.db' }, push: process.env.NODE_ENV !== 'production' }),
  upload: { limits: { fileSize: 15 * 1024 * 1024 } },
  sharp,
  telemetry: false,
  plugins: [
    // Uploads go to Supabase Storage (S3-compatible) when configured; otherwise to ./media locally
    s3Storage({
      enabled: Boolean(process.env.S3_BUCKET),
      collections: { media: true },
      bucket: process.env.S3_BUCKET || '',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'eu-west-2',
        forcePathStyle: true,
        credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID || '', secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '' },
      },
    }),
  ],
})
