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
      files: ["**/*.json", "**/*.json5", "**/*.jsonc"],
      parser: "jsonc-eslint-parser",
    },
  ],
  plugins: ['react', 'vitest'],
  settings: {
    react: {
      version: '16.13',
    },
  },
  rules: {
    'react/prop-types': ['warn'],
    'no-unused-vars': ['warn'],
    'jsonc/indent': ['error', 2],
    // 'jsonc/sort-keys': ['warn'],
    'jsonc/key-spacing': ['error'],
    'jsonc/no-irregular-whitespace': ['error'],
    'jsonc/object-curly-newline': ['error'],
    'jsonc/object-property-newline': ['error']
  },
}
