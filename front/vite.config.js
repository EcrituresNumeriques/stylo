import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig, loadEnv } from 'vite'
import handlebars from 'vite-plugin-handlebars'

import pkg from './package.json' with { type: 'json' }
import graphql from '@rollup/plugin-graphql'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { configDefaults, coverageConfigDefaults } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const envPrefix = ['SNOWPACK_', 'SENTRY_']

  const env = loadEnv(mode, fileURLToPath(import.meta.resolve('..')), envPrefix)
  const { SNOWPACK_MATOMO_URL, SNOWPACK_MATOMO_SITE_ID } = env
  const isDevelopment = Boolean(
    mode === 'development' || env.SENTRY_ENVIRONMENT === 'dev'
  )

  return {
    base: env.DEPLOY_PRIME_URL ?? '/',
    envPrefix,
    build: {
      outDir: 'build',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            metadata: [
              'biblatex-csl-converter',
              '@rjsf/core',
              '@rjsf/validator-ajv8',
            ],
            pagedPreview: ['pagedjs'],
            react: [
              'core-js',
              'i18next',
              'react',
              'react-dom',
              'react-dnd',
              'react-helmet',
              'react-i18next',
              'react-redux',
              'react-router',
              'redux',
            ],
            ui: ['@geist-ui/core', 'lucide-react'],
            textEditor: [
              'monaco-editor',
              '@monaco-editor/react',
              'y-monaco',
              'y-websocket',
              'yjs',
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
      env.SENTRY_AUTH_TOKEN &&
        sentryVitePlugin({
          org: env.SENTRY_ORG,
          project: env.SENTRY_PROJECT,
          authToken: env.SENTRY_AUTH_TOKEN,
          telemetry: true,
          debug: env.SENTRY_DEBUG,
          sourcemaps: {
            filesToDeleteAfterUpload: isDevelopment ? [] : ['*.js.map'],
          },
          release: {
            name: isDevelopment ? null : pkg.version,
            inject: true,
            create: true,
            deploy: {
              env: env.SENTRY_ENVIRONMENT,
              name: isDevelopment ? null : pkg.version,
            },
          },
        }),
      isDevelopment && visualizer(),
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
      __IMGUR_CLIENT_ID__: JSON.stringify(env.SNOWPACK_IMGUR_CLIENT_ID),
    },
    server: {
      port: 3000,
      proxy: {
        '/graphql': {
          target: 'http://127.0.0.1:3030',
        },
        '^/(login/|authorize/|logout|feed/|authorization-code|version)': {
          target: 'http://127.0.0.1:3030',
        },
        '/events': {
          target: 'http://127.0.0.1:3030',
          prependPath: false,
          ws: true,
        },
      },
    },

    test: {
      exclude: [...configDefaults.exclude, '**/e2e/*'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcovonly'],
        extension: ['.js', '.jsx'],
        exclude: [
          ...coverageConfigDefaults.exclude,
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
