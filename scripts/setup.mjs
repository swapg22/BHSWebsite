// Adds random test-account credentials to .env (git-ignored) if they are not already there.
import { randomBytes } from 'crypto'
import { existsSync, readFileSync, appendFileSync, copyFileSync, writeFileSync } from 'fs'

if (!existsSync('.env')) copyFileSync('.env.example', '.env')
let env = readFileSync('.env', 'utf8')
const add = []
const pw = () => randomBytes(12).toString('base64url') + '9a'
const accounts = {
  ADMIN: 'admin@bhs.test',
  EDITOR: 'editor@bhs.test',
  TREASURER: 'treasurer@bhs.test',
  MEMBERSHIP: 'membership@bhs.test',
  MEMBER: 'member@bhs.test',
}
for (const [k, email] of Object.entries(accounts)) {
  if (!new RegExp(`^SEED_${k}_EMAIL=`, 'm').test(env)) add.push(`SEED_${k}_EMAIL=${email}`)
  if (!new RegExp(`^SEED_${k}_PASSWORD=`, 'm').test(env)) add.push(`SEED_${k}_PASSWORD=${pw()}`)
}
for (const k of ['PAYLOAD_SECRET', 'APP_SIGNING_SECRET']) {
  if (new RegExp(`^${k}=change-me`, 'm').test(env)) {
    env = env.replace(new RegExp(`^${k}=.*$`, 'm'), `${k}=${randomBytes(32).toString('hex')}`)
    writeFileSync('.env', env)
  }
}
if (add.length) {
  appendFileSync('.env', `\n# Test accounts for local review (created by npm run setup)\n${add.join('\n')}\n`)
  console.log(`Added ${add.length / 2} test accounts to .env`)
} else console.log('Test accounts already present in .env')
