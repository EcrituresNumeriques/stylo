import { defineConfig, loadEnv } from 'vite'
import { createRequire } from 'module'
import process from 'node:process'
import react from '@vitejs/plugin-react'
import handlebars from 'vite-plugin-handlebars'
import graphql from '@rollup/plugin-graphql'

const require = createRequire(import.meta.url)
const { version } = require('../package.json')

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'SNOWPACK_')
  const { SNOWPACK_MATOMO_URL, SNOWPACK_MATOMO_SITE_ID } = env

  return {
    base: env.DEPLOY_PRIME_URL ?? '/',
    envPrefix: 'SNOWPACK_',
    build: {
      outDir: 'build',
      sourcemap: Boolean(env.ENABLE_SOURCEMAPS),
      rollupOptions: {
        output: {
          manualChunks: {
            writer: ['@monaco-editor/react', '@rjsf/core']
          }
        }
      }
    },
    plugins: [
      graphql(),
      react({
        jsxImportSource: mode === 'development' ? '@welldone-software/why-did-you-render' : 'react'
      }),
      // legacy({ target }),
      handlebars({
        context: {
          SNOWPACK_MATOMO: Boolean(SNOWPACK_MATOMO_URL) && Boolean(SNOWPACK_MATOMO_SITE_ID),
          SNOWPACK_MATOMO_URL,
          SNOWPACK_MATOMO_SITE_ID,
        }
      })
    ],
    define: {
      APP_VERSION: JSON.stringify(version),
    },
    resolve: {
      alias: {
        'react-redux': mode === 'development' ? 'react-redux/lib' : 'react-redux'
      }
    },
    server: {
      port: 3000,
      proxy: {
        '/graphql': {
          target: 'http://127.0.0.1:3030',
          prependPath: false
        },
        // as in infrastructure/files/stylo.huma-num.fr.conf
        '^/(login/openid|login/local|login/zotero|logout|authorization-code)': {
          target: 'http://127.0.0.1:3030'
        }
      }
    }
  }
})
