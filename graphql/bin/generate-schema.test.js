const { readFileSync } = require('node:fs')
const { describe, test } = require('node:test')
const assert = require('node:assert')
const { buildSchema } = require('graphql')

const { SCHEMA_PATH, printSchemaFile } = require('./generate-schema.js')
const schema = require('../schema.js')

describe('printSchemaFile', () => {
  test('prints the schema after a header, with the applied directives', () => {
    const printed = printSchemaFile(
      buildSchema('type Query { a: Int @deprecated(reason: "B") }')
    )
    assert.match(printed, /^# Generated from graphql\/schema\.js/)
    assert.match(printed, /a: Int @deprecated\(reason: "B"\)\n}\n$/)
  })

  test('schema.graphql is up to date (npm run generate-schema)', () => {
    assert.equal(readFileSync(SCHEMA_PATH, 'utf8'), printSchemaFile(schema))
  })
})
