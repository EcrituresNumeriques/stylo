import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import graphql from '@rollup/plugin-graphql'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig, loadEnv } from 'vite'
import handlebars from 'vite-plugin-handlebars'
import { configDefaults, coverageConfigDefaults } from 'vitest/config'
import pkg from './package.json' with { type: 'json' }

/**
 * Variables d'environnement renommées : nouveau nom → ancien nom (préfixe
 * SNOWPACK_, hérité de Snowpack). L'ancien nom reste lu en repli pour ne pas
 * casser les instances existantes.
 */
const legacyEnvNames = {
  FRONT_BACKEND_ENDPOINT: 'SNOWPACK_PUBLIC_BACKEND_ENDPOINT',
  FRONT_GRAPHQL_ENDPOINT: 'SNOWPACK_PUBLIC_GRAPHQL_ENDPOINT',
  FRONT_IMGUR_CLIENT_ID: 'SNOWPACK_IMGUR_CLIENT_ID',
  FRONT_MATOMO_SITE_ID: 'SNOWPACK_MATOMO_SITE_ID',
  FRONT_MATOMO_URL: 'SNOWPACK_MATOMO_URL',
  FRONT_PANDOC_EXPORT_HOST: 'SNOWPACK_PUBLIC_PANDOC_EXPORT_HOST',
  ANNOTATIONS_CANONICAL_BASE_URL:
    'SNOWPACK_PUBLIC_ANNOTATIONS_CANONICAL_BASE_URL',
  PANDOC_EXPORT_ENDPOINT: 'SNOWPACK_PUBLIC_PANDOC_EXPORT_ENDPOINT',
}

/**
 * @param {Record<string, string>} env
 * @returns {Record<string, string | undefined>}
 */
function resolveEnv(env) {
  return Object.fromEntries(
    Object.entries(legacyEnvNames).map(([name, legacyName]) => {
      if (env[name] === undefined && env[legacyName] !== undefined) {
        console.warn(
          `[stylo] La variable d'environnement ${legacyName} est obsolète, utilisez ${name} à la place.`
        )
        return [name, env[legacyName]]
      }
      return [name, env[name]]
    })
  )
}

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const envPrefix = ['FRONT_', 'SENTRY_']
  const env = loadEnv(mode, fileURLToPath(join(import.meta.url, '..', '..')), [
    ...envPrefix,
    ...Object.keys(legacyEnvNames),
    ...Object.values(legacyEnvNames),
  ])
  const config = resolveEnv(env)
  const { FRONT_MATOMO_URL, FRONT_MATOMO_SITE_ID } = config
  const isDevelopment = Boolean(
    mode === 'development' || env.SENTRY_ENVIRONMENT === 'dev'
  )
  // Shared by the Sentry plugin (release, commits, deploy) and the SDK
  // (events): both must use the same name, or Sentry ends up with two
  // releases. On dev deployments, each commit gets its own release.
  const sentryRelease =
    isDevelopment && process.env.GITHUB_SHA
      ? `stylo-front@${process.env.GITHUB_SHA}`
      : `stylo-front@${pkg.version}`

  return {
    base: env.DEPLOY_PRIME_URL ?? '/',
    envPrefix,
    build: {
      outDir: 'build',
      sourcemap: true,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'core',
                test: /node_modules\/(core-js|i18next|lucide-react|redux|react|react-.+)/,
                priority: 5,
              },
              {
                name: 'textEditor',
                test: /node_modules\/(monaco-editor|monaco-.+|@monaco-editor\/.+|yjs|y-.+)/,
                priority: 5,
              },
              // {
              //   name: 'vendor',
              //   test: /node_modules/,
              //   priority: 10,
              // },
              {
                name: 'pagedPreview',
                test: /node_modules\/pagedjs/,
                priority: 90,
              },
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
      handlebars({
        context: {
          MATOMO: Boolean(FRONT_MATOMO_URL) && Boolean(FRONT_MATOMO_SITE_ID),
          MATOMO_URL: FRONT_MATOMO_URL,
          MATOMO_SITE_ID: FRONT_MATOMO_SITE_ID,
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
            name: sentryRelease,
            inject: true,
            create: true,
            deploy: {
              env: env.SENTRY_ENVIRONMENT,
              name: sentryRelease,
            },
          },
        }),
      isDevelopment && visualizer(),
    ],
    define: {
      APP_VERSION: JSON.stringify(pkg.version),
      APP_RELEASE: JSON.stringify(sentryRelease),
      APP_ENVIRONMENT: JSON.stringify(env.SENTRY_ENVIRONMENT),
      SENTRY_DSN: JSON.stringify(env.SENTRY_DSN),
      __ANNOTATIONS_CANONICAL_BASE_URL__: JSON.stringify(
        config.ANNOTATIONS_CANONICAL_BASE_URL
      ),
      __BACKEND_ENDPOINT__: JSON.stringify(config.FRONT_BACKEND_ENDPOINT),
      __GRAPHQL_ENDPOINT__: JSON.stringify(config.FRONT_GRAPHQL_ENDPOINT),
      __PANDOC_EXPORT_ENDPOINT__: JSON.stringify(config.PANDOC_EXPORT_ENDPOINT),
      __PANDOC_EXPORT_HOST__: JSON.stringify(config.FRONT_PANDOC_EXPORT_HOST),
      __MATOMO_URL__: JSON.stringify(FRONT_MATOMO_URL),
      __IMGUR_CLIENT_ID__: JSON.stringify(config.FRONT_IMGUR_CLIENT_ID),
    },
    server: {
      port: 3000,
      proxy: {
        '/backup': {
          target: 'http://127.0.0.1:3030',
        },
        '/nakala': {
          target: 'http://127.0.0.1:3030',
        },
        '/graphql': {
          target: 'http://127.0.0.1:3030',
        },
        '^/(login/|authorize/|logout|feed/|community/|authorization-code|version)':
          {
            target: 'http://127.0.0.1:3030',
          },
        '^/(events|ws)': {
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
