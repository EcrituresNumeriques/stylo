const { describe, test } = require('node:test')
const assert = require('node:assert')
const { isObjectType, parse, specifiedRules, validate } = require('graphql')

const schema = require('../schema.js')
const {
  SERVICE_QUERY_FIELDS,
  ServiceReadOnlyRule,
  validationRules,
} = require('./serviceAccess.js')

/**
 * @param {string} query
 * @returns {string[]} messages of the validation errors
 */
function validateAsService(query) {
  const rules = validationRules(
    {},
    { contextValue: { principal: { kind: 'service', name: 'test' } } },
    specifiedRules
  )
  return validate(schema, parse(query), rules).map((error) => error.message)
}

describe('validationRules', () => {
  test('adds the rule for a service only', () => {
    const rulesFor = (principal) =>
      validationRules({}, { contextValue: { principal } }, specifiedRules)

    assert.ok(rulesFor({ kind: 'service' }).includes(ServiceReadOnlyRule))
    assert.equal(rulesFor({ kind: 'user' }), specifiedRules)
    assert.equal(rulesFor({ kind: 'anonymous' }), specifiedRules)
    assert.equal(validationRules({}, {}, specifiedRules), specifiedRules)
  })
})

describe('ServiceReadOnlyRule', () => {
  // queries sent by stylo-export (styloexport/styloapi.py)
  test('accepts the queries of the export service', () => {
    const queries = [
      `query ($article: ID!) {
        article(article: $article) {
          _id
          title
          workingVersion { md bib metadata }
          versions { _id version revision message md bib metadata }
        }
      }`,
      `query ($version: ID!) {
        version(version: $version) { article { _id } }
      }`,
      `query ($corpus: ID!) {
        corpus(filter: { corpusId: $corpus }) {
          _id
          name
          description
          metadata
          articles { article { _id title } }
        }
      }`,
    ]
    for (const query of queries) {
      assert.deepEqual(validateAsService(query), [])
    }
  })

  test('accepts the new names of the arguments', () => {
    assert.deepEqual(
      validateAsService(`{ article(articleId: "1") { _id } }`),
      []
    )
    assert.deepEqual(
      validateAsService(`{ version(versionId: "1") { _id } }`),
      []
    )
  })

  test('rejects mutations', () => {
    assert.deepEqual(
      validateAsService(`mutation { deleteArticle(articleId: "1") { id } }`),
      ['A service is only allowed to run queries.']
    )
  })

  test('rejects the other fields at the root of a query', () => {
    for (const query of [
      `{ user { email } }`,
      `{ articles { _id } }`,
      `{ workspaces { _id } }`,
      `{ tags { _id } }`,
      `{ __schema { types { name } } }`,
      `{ __typename }`,
    ]) {
      const [message, ...others] = validateAsService(query)
      assert.match(message, /^A service is not allowed to query Query\./)
      assert.deepEqual(others, [])
    }
  })

  test('rejects the fields that write data below the root', () => {
    for (const [query, coordinate] of [
      [`{ article(articleId: "1") { rename(title: "x") } }`, 'Article.rename'],
      [`{ article(articleId: "1") { delete } }`, 'Article.delete'],
      [
        `{ article(articleId: "1") { versions { rename(name: "x") } } }`,
        'Version.rename',
      ],
      [
        `{ corpus(filter: { corpusId: "1" }) { rename(name: "x") { _id } } }`,
        'Corpus.rename',
      ],
    ]) {
      assert.deepEqual(validateAsService(query), [
        `A service is not allowed to use the deprecated field ${coordinate}.`,
      ])
    }
  })

  test('checks the fields used in fragments', () => {
    assert.deepEqual(
      validateAsService(`
        query { article(articleId: "1") { ...Write } }
        fragment Write on Article { addTags(tags: ["1"]) { _id } }
      `),
      ['A service is not allowed to use the deprecated field Article.addTags.']
    )
    assert.deepEqual(
      validateAsService(`
        query { ...Root }
        fragment Root on Query { articles { _id } }
      `),
      ['A service is not allowed to query Query.articles.']
    )
  })

  test('only allows fields that exist at the root of a query', () => {
    const queryFields = schema.getQueryType().getFields()
    for (const name of SERVICE_QUERY_FIELDS) {
      assert.ok(queryFields[name], `Query.${name} does not exist`)
    }
  })

  /**
   * The rule relies on a convention: outside `Mutation`, a field that writes data is deprecated.
   * A field that takes arguments is the usual shape of such a field,
   * so a new one must be reviewed and added to this list (when it only reads data).
   */
  test('knows every field with arguments that a service can use below the root', () => {
    const roots = [schema.getQueryType(), schema.getMutationType()]
    const found = Object.values(schema.getTypeMap())
      .filter((type) => isObjectType(type) && !type.name.startsWith('__'))
      .filter((type) => !roots.includes(type))
      .flatMap((type) =>
        Object.values(type.getFields())
          .filter((field) => field.args.length > 0)
          .filter((field) => field.deprecationReason == null)
          .map((field) => `${type.name}.${field.name}`)
      )

    assert.deepEqual(found.sort(), [
      'Article.versions',
      'Corpus.article',
      'User.articles',
      'Version.yaml',
      'WorkingVersion.yaml',
      'Workspace.article',
      'Workspace.member',
    ])
  })
})
