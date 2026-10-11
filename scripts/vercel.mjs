// Runs the Vercel CLI with VERCEL_TOKEN from .env, without the token appearing in commands or logs.
//   node scripts/vercel.mjs whoami
import 'dotenv/config'
import { spawnSync } from 'child_process'

if (!process.env.VERCEL_TOKEN) {
  console.error('Add VERCEL_TOKEN=… to .env first')
  process.exit(1)
}
const res = spawnSync('npx', ['-y', 'vercel@60.1.3', ...process.argv.slice(2)], {
  stdio: ['inherit', 'pipe', 'pipe'],
  env: { ...process.env, VERCEL_TELEMETRY_DISABLED: '1' },
  encoding: 'utf8',
})
const scrub = (s) => (s ?? '').split(process.env.VERCEL_TOKEN).join('****')
process.stdout.write(scrub(res.stdout))
process.stderr.write(scrub(res.stderr))
process.exit(res.status ?? 1)
