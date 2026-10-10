import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/unit/**/*.spec.ts', 'tests/int/**/*.int.spec.ts'],
    // Integration tests share one SQLite test database
    fileParallelism: false,
    testTimeout: 60000,
    hookTimeout: 120000,
    server: { deps: { inline: ['server-only'] } },
    alias: { 'server-only': new URL('./tests/helpers/empty.ts', import.meta.url).pathname },
  },
})
