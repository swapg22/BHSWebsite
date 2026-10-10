import 'dotenv/config'

// Integration tests run against their own database file so they never touch local data
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'file:./data/test.db'
process.env.APP_SIGNING_SECRET ||= 'test-signing-secret'
