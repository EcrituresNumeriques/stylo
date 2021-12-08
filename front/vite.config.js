import { defineConfig } from 'vite'
import { env } from 'process'
import react from '@vitejs/plugin-react'
import handlebars from 'vite-plugin-handlebars'

const { NODE_ENV, SNOWPACK_MATOMO_URL, SNOWPACK_MATOMO_SITE_ID } = env

// https://vitejs.dev/config/
export default defineConfig({
  base: env.DEPLOY_PRIME_URL ?? '/',
  envPrefix: 'SNOWPACK_',
  build: {
    outDir: 'build',
    sourcemap: Boolean(env.ENABLE_SOURCEMAPS),
    rollupOptions: {
      output: {
        manualChunks: {
          codemirror: ['react-codemirror2', 'codemirror']
        }
      }
    }
  },
  plugins: [
    react(),
    handlebars({
      context: {
        NODE_ENV,
        SNOWPACK_MATOMO: Boolean(SNOWPACK_MATOMO_URL) && Boolean(SNOWPACK_MATOMO_SITE_ID),
        SNOWPACK_MATOMO_URL,
        SNOWPACK_MATOMO_SITE_ID,
      }
    })
  ],
  define: {
    'process.env': {
      NODE_ENV: env.NODE_ENV
    },
    'global.PREVENT_CODEMIRROR_RENDER': false,
  }
})
