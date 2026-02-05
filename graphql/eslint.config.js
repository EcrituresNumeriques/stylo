const globals = require('globals')
const pluginSecurity = require('eslint-plugin-security')
const eslint = require('@eslint/js')
const eslintConfigPrettier = require('eslint-config-prettier')

module.exports = [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.test.js', '**/tests/**.js'],
    rules: {
      'security/detect-object-injection': ['off'],
      'security/detect-non-literal-fs-filename': ['off'],
    },
  },
  eslint.configs.recommended,
  pluginSecurity.configs.recommended,
  eslintConfigPrettier,
]
