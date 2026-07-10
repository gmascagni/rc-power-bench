import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Crucial for static hosting assets to resolve
  build: {
    outDir: 'docs' // Builds into a docs folder instead of dist
  }
})
