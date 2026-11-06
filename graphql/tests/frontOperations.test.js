const fs = require('node:fs')
const path = require('node:path')
const { describe, test } = require('node:test')
const assert = require('node:assert')
const {
  Kind,
  NoDeprecatedCustomRule,
  parse,
  specifiedRules,
  validate,
} = require('graphql')
const schema = require('../schema.js')

const frontSourceDir = path.join(__dirname, '..', '..', 'front', 'src')

/**
 * Deprecated fields that the front is still allowed to use, with the issue that will remove them.
 * Each message is the one reported by NoDeprecatedCustomRule.
 */
const allowedDeprecations = [
  {
    // corpus(corpusId) returning a single corpus is a breaking change, planned for the next major version
    issue: '#2130',
    message: /^The field Query\.corpus is deprecated\./,
  },
]

function findGraphQLFiles(dir) {
  return fs
    .readdirSync(dir, { recursive: true })
    .filter((file) => file.endsWith('.graphql'))
    .map((file) => path.join(dir, file))
}

/**
 * Each front operation is validated with all the fragments of the front:
 * the fragments are shared between files with #import comments, which GraphQL ignores.
 */
function loadFrontOperations() {
  const documents = findGraphQLFiles(frontSourceDir).map((file) => ({
    file: path.relative(frontSourceDir, file),
    document: parse(fs.readFileSync(file, 'utf8')),
  }))
  const fragments = documents.flatMap(({ document }) =>
    document.definitions.filter((d) => d.kind === Kind.FRAGMENT_DEFINITION)
  )
  return documents.flatMap(({ file, document }) =>
    document.definitions
      .filter((d) => d.kind === Kind.OPERATION_DEFINITION)
      .map((operation) => ({
        name: `${file} ${operation.name?.value ?? '(anonymous)'}`,
        document: {
          kind: Kind.DOCUMENT,
          definitions: [operation, ...fragments],
        },
      }))
  )
}

const operations = loadFrontOperations()
const unusedFragment = /^Fragment "\w+" is never used\.$/

function deprecationErrors() {
  return operations.flatMap(({ name, document }) =>
    validate(schema, document, [NoDeprecatedCustomRule]).map((error) => ({
      name,
      message: error.message,
    }))
  )
}

function failWith(title, lines) {
  if (lines.length > 0) {
    assert.fail(`${title}\n${lines.map((line) => `- ${line}`).join('\n')}`)
  }
}

describe('front GraphQL operations', () => {
  test('are found', () => {
    assert.ok(operations.length > 0, `no operation found in ${frontSourceDir}`)
  })

  test('are valid against the schema', () => {
    const errors = operations.flatMap(({ name, document }) =>
      validate(schema, document, specifiedRules)
        .filter((error) => !unusedFragment.test(error.message))
        .map((error) => `${name}: ${error.message}`)
    )
    failWith('Some front operations are invalid:', errors)
  })

  test('do not use deprecated fields, arguments or enum values', () => {
    const errors = deprecationErrors()
      .filter(
        ({ message }) =>
          !allowedDeprecations.some((allowed) => allowed.message.test(message))
      )
      .map(({ name, message }) => `${name}: ${message}`)
    failWith(
      'Some front operations use deprecated schema elements, use the replacement given in the deprecation reason (see graphql/CONVENTIONS.md):',
      errors
    )
  })

  test('only allow deprecations that are still used', () => {
    const errors = deprecationErrors()
    const unused = allowedDeprecations
      .filter(
        (allowed) =>
          !errors.some(({ message }) => allowed.message.test(message))
      )
      .map(({ issue, message }) => `${message} (${issue})`)
    failWith(
      'These allowed deprecations are no longer used by the front, remove them from allowedDeprecations:',
      unused
    )
  })
})
