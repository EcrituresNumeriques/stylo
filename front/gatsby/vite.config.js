import { defineConfig } from 'vite'
import { env } from 'process'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'build',
  },
  plugins: [
    react(),
  ],
  define: {
    'process.env': {
      NODE_ENV: env.NODE_ENV
    },
    'global.PREVENT_CODEMIRROR_RENDER': false,
  },
  optimizeDeps: {
  }
})
