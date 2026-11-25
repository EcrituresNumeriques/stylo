const { describe, test } = require('node:test')
const assert = require('node:assert')
const {
  buildSchema,
  getNamedType,
  isObjectType,
  isLeafType,
  parse,
  specifiedRules,
  validate,
} = require('graphql')

const { validationRules, isWriteField } = require('./readOnlyToken.js')

const schema = buildSchema(`
  type Article {
    title: String
    delete: Boolean @deprecated(reason: "Use deleteArticle mutation at the root instead.")
    _id: ID @deprecated(reason: "Use id instead.")
  }
  type Query { hello: String, article: Article }
  type Mutation { update: String }
`)

function errors(source, token, target = schema) {
  const rules = validationRules(
    null,
    { contextValue: { token } },
    specifiedRules
  )
  return validate(target, parse(source), rules)
}

function forbidden(result) {
  return result.filter((error) => error.extensions?.code === 'FORBIDDEN')
}

describe('validationRules', () => {
  test('keeps the specified rules for a regular token', () => {
    assert.equal(
      validationRules(null, { contextValue: { token: {} } }, specifiedRules),
      specifiedRules
    )
  })

  test('allows mutations and write fields for a regular token', () => {
    assert.deepEqual(errors('mutation { update }', { _id: 'abc' }), [])
    assert.deepEqual(errors('{ article { delete } }', { _id: 'abc' }), [])
  })

  test('allows queries and other deprecated fields for a read-only token', () => {
    assert.deepEqual(
      errors('{ hello article { title _id } }', { readonly: true }),
      []
    )
  })

  test('rejects mutations for a read-only token', () => {
    const [error] = errors('mutation { update }', {
      admin: true,
      readonly: true,
    })
    assert.equal(error.extensions.code, 'FORBIDDEN')
  })

  test('rejects a mutation hidden among several operations', () => {
    const result = errors('query A { hello } mutation B { update }', {
      readonly: true,
    })
    assert.equal(result.length, 1)
  })

  test('rejects a field that writes data, even in a query', () => {
    for (const source of [
      '{ article { delete } }',
      '{ article { ... on Article { remove: delete } } }',
      'query { ...F } fragment F on Query { article { delete } }',
    ]) {
      const [error] = errors(source, { readonly: true })
      assert.equal(error?.extensions.code, 'FORBIDDEN', source)
    }
  })
})

describe('read-only token on the Stylo schema', () => {
  const styloSchema = require('../schema.js')

  /**
   * Finds, for each object type reachable from Query, the path of fields leading to it.
   *
   * @returns {Map<string, string[]>}
   */
  function pathsFromQuery() {
    const paths = new Map([['Query', []]])
    const queue = ['Query']
    while (queue.length) {
      const typeName = queue.shift()
      const type = styloSchema.getType(typeName)
      for (const field of Object.values(type.getFields())) {
        const target = getNamedType(field.type)
        if (isObjectType(target) && !paths.has(target.name)) {
          paths.set(target.name, [...paths.get(typeName), field.name])
          queue.push(target.name)
        }
      }
    }
    return paths
  }

  const writeFields = Object.values(styloSchema.getTypeMap())
    .filter((type) => isObjectType(type) && type.name !== 'Mutation')
    .flatMap((type) =>
      Object.values(type.getFields())
        .filter(isWriteField)
        .map((field) => ({ type, field }))
    )

  test('recognizes exactly the deprecated nested mutations', () => {
    // If this list changes, check that every field writing data outside Mutation is still recognized:
    // the rule relies on the deprecation reason ("Use … mutation at the root instead.").
    const coordinates = writeFields
      .map(({ type, field }) => `${type.name}.${field.name}`)
      .sort()
    assert.deepEqual(coordinates, [
      'Article.addContributor',
      'Article.addTags',
      'Article.createVersion',
      'Article.delete',
      'Article.removeContributor',
      'Article.removeTags',
      'Article.rename',
      'Article.setNakalaLink',
      'Article.setPreviewSettings',
      'Article.setZoteroLink',
      'Article.updateWorkingVersion',
      'Corpus.addArticle',
      'Corpus.delete',
      'Corpus.rename',
      'Corpus.update',
      'Corpus.updateArticlesOrder',
      'Corpus.updateMetadata',
      'CorpusArticle.move',
      'CorpusArticle.remove',
      'User.addContact',
      'User.removeContact',
      'Version.rename',
      'Workspace.addArticle',
      'Workspace.inviteMember',
      'Workspace.leave',
      'WorkspaceArticle.remove',
      'WorkspaceMember.remove',
    ])
  })

  test('rejects every write field when it is selected in a query', () => {
    const paths = pathsFromQuery()
    for (const { type, field } of writeFields) {
      const path = paths.get(type.name)
      if (!path) {
        // not reachable from Query, so it cannot be selected in a query
        continue
      }
      const leaf = isLeafType(getNamedType(field.type))
        ? field.name
        : `${field.name} { __typename }`
      const source = `query { ${[...path, leaf].join(' { ')}${' }'.repeat(path.length)} }`
      // missing arguments are reported by other rules, only the FORBIDDEN error matters here
      const result = forbidden(errors(source, { readonly: true }, styloSchema))
      assert.equal(result.length, 1, source)
    }
  })
})
