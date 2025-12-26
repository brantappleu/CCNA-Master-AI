import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-markdown', 'lucide-react', 'recharts'],
          genai: ['@google/genai']
        }
      }
    }
  },
  define: {
    // Safely replace process.env.API_KEY with the string value from Cloudflare
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
})