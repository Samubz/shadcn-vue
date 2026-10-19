import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Script tests import registry sources, which use the `@/` alias Nuxt provides.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
})
