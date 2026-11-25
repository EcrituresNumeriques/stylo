#!/usr/bin/env node

/**
 * Writes the GraphQL schema of `graphql/schema.js` to `schema.graphql`,
 * at the root of the repository (read by the IDEs, through `graphql.config.yml`).
 * The directives applied to the types and fields are printed too.
 */

const { writeFileSync } = require('node:fs')
const { join } = require('node:path')
const { printSchemaWithDirectives } = require('@graphql-tools/utils')

const SCHEMA_PATH = join(__dirname, '..', '..', 'schema.graphql')
const HEADER =
  '# Generated from graphql/schema.js by `npm run generate-schema --workspace graphql`: do not edit manually.'

/**
 * @param {import('graphql').GraphQLSchema} schema
 * @returns {string} the content of `schema.graphql`
 */
function printSchemaFile(schema) {
  return `${HEADER}\n\n${printSchemaWithDirectives(schema)}\n`
}

if (require.main === module) {
  writeFileSync(SCHEMA_PATH, printSchemaFile(require('../schema.js')))
}

module.exports = { SCHEMA_PATH, printSchemaFile }
