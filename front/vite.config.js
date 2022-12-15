import { defineConfig } from 'vite'
import { env } from 'process'
import { createRequire } from 'module'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import handlebars from 'vite-plugin-handlebars'

const require = createRequire(import.meta.url)
const { version } = require('./package.json')

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
    legacy(),
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
    APP_VERSION: JSON.stringify(version),
    'process.env': {
      NODE_ENV: env.NODE_ENV
    },
    'global.PREVENT_CODEMIRROR_RENDER': false,
  },
  server: {
    port: 3000
  }
})
