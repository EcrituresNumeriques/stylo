import prettier from 'eslint-config-prettier'
import jsdoc from 'eslint-plugin-jsdoc'
import jsonc from 'eslint-plugin-jsonc'
import react from 'eslint-plugin-react'
import globals from 'globals'

import js from '@eslint/js'
import vitest from '@vitest/eslint-plugin'

export default [
  {
    settings: {
      react: {
        version: '18.3',
      },
    },
  },
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  jsdoc.configs['flat/recommended-typescript-flavor'],
  prettier,
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        APP_VERSION: 'readonly',
        APP_ENVIRONMENT: 'readonly',
        SENTRY_DSN: 'readonly',
        _paq: 'readonly',
        __ANNOTATIONS_CANONICAL_BASE_URL__: 'readonly',
        __BACKEND_ENDPOINT__: 'readonly',
        __GRAPHQL_ENDPOINT__: 'readonly',
        __PANDOC_EXPORT_ENDPOINT__: 'readonly',
        __IMGUR_CLIENT_ID__: 'readonly',
      },
    },
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      'jsdoc/require-description': 'off',
      'jsdoc/require-example': 'off',
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-returns-description': 'off',
      'jsdoc/require-property-description': 'off',
      'react/prop-types': 'off',
      'no-unused-vars': 'warn',
    },
  },
  // JSON files configuration
  ...jsonc.configs['flat/recommended-with-json'],
  {
    files: ['**/*.json', '**/*.json5', '**/*.jsonc'],
    rules: {
      'jsonc/indent': ['error', 2],
      'jsonc/key-spacing': 'error',
      'jsonc/no-irregular-whitespace': 'error',
      'jsonc/object-curly-newline': 'error',
      'jsonc/object-property-newline': 'error',
    },
  },
  {
    files: ['**/locales/**/*.json'],
    rules: {
      'no-irregular-whitespace': 'off',
      'jsonc/sort-keys': ['error', 'asc'],
    },
  },
]
