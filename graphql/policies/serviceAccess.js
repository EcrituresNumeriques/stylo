const { GraphQLError } = require('graphql')

/**
 * What a service is allowed to ask for, at the root of a query.
 * Anything that is not listed here is refused.
 */
const SERVICE_QUERY_FIELDS = new Set(['article', 'corpus', 'version'])

/**
 * Deprecated fields that a service can still read below the root.
 * The identifiers are deprecated in favour of `id`, the export service still uses them.
 */
const SERVICE_DEPRECATED_FIELDS = new Set(['_id'])

/**
 * @param {string} message
 * @param {import('graphql').ASTNode} node
 * @returns {GraphQLError}
 */
function forbidden(message, node) {
  return new GraphQLError(message, {
    nodes: [node],
    extensions: { code: 'NOT_AUTHORIZED', http: { status: 403 } },
  })
}

/**
 * Validation rule applied to the requests of a service, which can only read:
 * - queries only (no mutation);
 * - at the root, only the fields listed in `SERVICE_QUERY_FIELDS`;
 * - below the root, no deprecated field, except the ones listed in `SERVICE_DEPRECATED_FIELDS`.
 *   The fields that write data outside `Mutation` (for instance `Article.rename`) are all deprecated,
 *   and the API conventions forbid adding new ones.
 *
 * @param {import('graphql').ValidationContext} context
 * @returns {import('graphql').ASTVisitor}
 */
function ServiceReadOnlyRule(context) {
  const queryType = context.getSchema().getQueryType()

  return {
    OperationDefinition(node) {
      if (node.operation !== 'query') {
        context.reportError(
          forbidden('A service is only allowed to run queries.', node)
        )
      }
    },
    Field(node) {
      const parentType = context.getParentType()
      const fieldDef = context.getFieldDef()
      if (!parentType || !fieldDef) {
        // unknown field, already reported by the rules of the GraphQL specification
        return
      }
      const coordinate = `${parentType.name}.${fieldDef.name}`
      if (parentType === queryType) {
        if (!SERVICE_QUERY_FIELDS.has(fieldDef.name)) {
          context.reportError(
            forbidden(`A service is not allowed to query ${coordinate}.`, node)
          )
        }
      } else if (
        fieldDef.deprecationReason != null &&
        !SERVICE_DEPRECATED_FIELDS.has(fieldDef.name)
      ) {
        context.reportError(
          forbidden(
            `A service is not allowed to use the deprecated field ${coordinate}.`,
            node
          )
        )
      }
    },
  }
}

/**
 * Returns the validation rules to apply to a GraphQL request, depending on who is calling.
 * Signature expected by the `validationRules` option of graphql-http.
 *
 * @param {unknown} _req
 * @param {{ contextValue?: { principal?: import('../auth/principal.js').Principal } }} args
 * @param {readonly import('graphql').ValidationRule[]} specifiedRules
 * @returns {readonly import('graphql').ValidationRule[]}
 */
function validationRules(_req, args, specifiedRules) {
  if (args.contextValue?.principal?.kind === 'service') {
    return [...specifiedRules, ServiceReadOnlyRule]
  }
  return specifiedRules
}

module.exports = { SERVICE_QUERY_FIELDS, ServiceReadOnlyRule, validationRules }
