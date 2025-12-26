import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  define: {
    // Safely replace process.env.API_KEY with the string value from Cloudflare
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
})