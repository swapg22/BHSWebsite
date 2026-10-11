// Runs an npm script against the Supabase database without exposing the password:
//   node scripts/supabase.mjs db:migrate
// Reads SUPABASE_DATABASE_URL from .env and passes it to the child process as DATABASE_URL.
import 'dotenv/config'
import { spawnSync } from 'child_process'

const url = process.env.SUPABASE_DATABASE_URL
if (!url || !url.startsWith('postgres')) {
  console.error('Add SUPABASE_DATABASE_URL=postgresql://… to .env first (see README)')
  process.exit(1)
}
if (/\[YOUR-PASSWORD\]/i.test(url)) {
  console.error('SUPABASE_DATABASE_URL still contains [YOUR-PASSWORD]: replace it with the database password')
  process.exit(1)
}
const script = process.argv[2]
if (!script) {
  console.error('Usage: node scripts/supabase.mjs <npm script> [args]')
  process.exit(1)
}
const res = spawnSync('npm', ['run', script, '--', ...process.argv.slice(3)], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DATABASE_URL: url,
    NODE_ENV: process.env.NODE_ENV ?? 'production',
    // Supabase Storage settings are used only when working against Supabase, never by the local preview
    ...Object.fromEntries(
      ['BUCKET', 'ENDPOINT', 'REGION', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY']
        .filter((k) => process.env[`SUPABASE_S3_${k}`])
        .map((k) => [`S3_${k}`, process.env[`SUPABASE_S3_${k}`]]),
    ),
  },
})
process.exit(res.status ?? 1)
