module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jsonc/recommended-with-json',
    'plugin:jsdoc/recommended-typescript-flavor',
    'prettier',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 13,
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['**/*.json', '**/*.json5', '**/*.jsonc'],
      parser: 'jsonc-eslint-parser',
    },
  ],
  plugins: ['react', 'vitest', 'jsdoc'],
  settings: {
    react: {
      version: '18.3',
    },
  },
  globals: {
    APP_VERSION: true,
    APP_ENVIRONMENT: true,
  },
  rules: {
    'jsdoc/require-description': ['off'],
    'jsdoc/require-example': ['off'],
    'jsdoc/require-jsdoc': ['off'],
    'jsdoc/require-param-description': ['off'],
    'jsdoc/require-returns-description': ['off'],
    'jsdoc/require-property-description': ['off'],
    'react/prop-types': 'off',
    'no-unused-vars': ['warn'],
    'jsonc/indent': ['error', 2],
    // 'jsonc/sort-keys': ['warn'],
    'jsonc/key-spacing': ['error'],
    'jsonc/no-irregular-whitespace': ['error'],
    'jsonc/object-curly-newline': ['error'],
    'jsonc/object-property-newline': ['error'],
  },
}
