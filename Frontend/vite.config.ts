import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Ensures the app is served from the root path
  build: {
    outDir: 'dist',
  }
})