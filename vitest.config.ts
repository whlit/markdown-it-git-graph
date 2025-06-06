import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['./test/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['./test/**/*.ts'],
    },
  },
})
