import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      reporter: ['text', 'json-summary', 'json'],
    },
    include: ['test/**/*.e2e.spec.ts'],
  },
})
