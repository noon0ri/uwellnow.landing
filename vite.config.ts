/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // the live site already serves /assets/ from the same bucket
  build: { assetsDir: 'assets-home' },
  test: { environment: 'jsdom', setupFiles: ['tests/setup.ts'], globals: true },
})
