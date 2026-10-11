import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    // Staff pages link into the Payload admin, a separate root layout, so plain <a> is intended
    files: ['src/components/admin/**', 'src/app/(frontend)/staff/**', 'src/app/(frontend)/account/page.tsx'],
    rules: { '@next/next/no-html-link-for-pages': 'off' },
  },
  {
    // Server components render per request, so reading the clock is fine there
    files: ['src/app/(frontend)/**/page.tsx'],
    rules: { 'react-hooks/purity': 'off' },
  },
  { ignores: ['.next/', 'node_modules/', 'src/payload-types.ts', 'src/app/(payload)/', 'src/migrations/*_initial_schema.ts', 'playwright-report/', 'test-results/', 'media/', 'data/'] },
]

export default config
