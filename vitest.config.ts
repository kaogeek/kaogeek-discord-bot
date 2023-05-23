import tsconfigPaths from 'vite-tsconfig-paths'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      reporter: ['text', 'json-summary', 'json'],
    },
    exclude: [...configDefaults.exclude, '**/*.e2e.spec.ts'],
  },
})
