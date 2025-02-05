import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import pkg from './package.json' assert { type: 'json' }
import react from '@vitejs/plugin-react'
import handlebars from 'vite-plugin-handlebars'
import graphql from '@rollup/plugin-graphql'

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(import.meta.resolve('..')), [
    'SNOWPACK_',
    'SENTRY_',
  ])
  const { SNOWPACK_MATOMO_URL, SNOWPACK_MATOMO_SITE_ID } = env
  const sourcemap =
    env.SNOWPACK_SOURCEMAPS || env.SENTRY_ENVIRONMENT === 'dev' || false

  return {
    base: env.DEPLOY_PRIME_URL ?? '/',
    envPrefix: 'SNOWPACK_',
    build: {
      outDir: 'build',
      sourcemap,
      rollupOptions: {
        output: {
          manualChunks: {
            writer: [
              'monaco-editor',
              'y-monaco',
              '@monaco-editor/react',
              '@rjsf/core',
            ],
          },
        },
      },
    },
    plugins: [
      graphql(),
      react({
        jsxImportSource:
          mode === 'development'
            ? '@welldone-software/why-did-you-render'
            : 'react',
      }),
      // legacy({ target }),
      handlebars({
        context: {
          SNOWPACK_MATOMO:
            Boolean(SNOWPACK_MATOMO_URL) && Boolean(SNOWPACK_MATOMO_SITE_ID),
          SNOWPACK_MATOMO_URL,
          SNOWPACK_MATOMO_SITE_ID,
        },
      }),
      sentryVitePlugin({
        org: 'ecrinum-stylo',
        project: 'stylo-front',
        authToken: env.SENTRY_AUTH_TOKEN,
      }),
    ],
    define: {
      APP_VERSION: JSON.stringify(pkg.version),
      APP_ENVIRONMENT: JSON.stringify(env.SENTRY_ENVIRONMENT),
      SENTRY_DSN: JSON.stringify(env.SENTRY_DSN),
      __ANNOTATIONS_CANONICAL_BASE_URL__: JSON.stringify(
        env.SNOWPACK_PUBLIC_ANNOTATIONS_CANONICAL_BASE_URL
      ),
      __BACKEND_ENDPOINT__: JSON.stringify(
        env.SNOWPACK_PUBLIC_BACKEND_ENDPOINT
      ),
      __GRAPHQL_ENDPOINT__: JSON.stringify(
        env.SNOWPACK_PUBLIC_GRAPHQL_ENDPOINT
      ),
      __PANDOC_EXPORT_ENDPOINT__: JSON.stringify(
        env.SNOWPACK_PUBLIC_PANDOC_EXPORT_ENDPOINT
      ),
      __HUMANID_REGISTER_ENDPOINT__: JSON.stringify(
        env.SNOWPACK_PUBLIC_HUMAN_ID_REGISTER_ENDPOINT
      ),
    },
    resolve: {
      alias: {
        'react-redux':
          mode === 'development' ? 'react-redux/lib' : 'react-redux',
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/graphql': {
          target: 'http://127.0.0.1:3030',
          prependPath: false,
        },
        // as in infrastructure/files/stylo.huma-num.fr.conf
        '^/(login/openid|login/local|login/zotero|logout|authorization-code|events)':
          {
            target: 'http://127.0.0.1:3030',
          },
      },
    },

    test: {
      coverage: {
        reporter: ['text', 'html', 'lcovonly'],
        extension: ['.js', '.jsx'],
        exclude: [
          '**/build/**',
          '**/public/**',
          '**/*.config.*',
          '**/{tests,bin}/*',
          '**/*.test.jsx?',
        ],
      },
      environment: 'jsdom',
      setupFiles: ['./tests/setup.js'],
    },
  }
})
