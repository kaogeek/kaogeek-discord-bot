import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json-summary', 'json'],
    },
    include: ['test/**/*.e2e.spec.ts'],
  },
})
