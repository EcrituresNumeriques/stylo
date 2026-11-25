const { GraphQLError } = require('graphql')

/**
 * Fields outside `Mutation` that write data are the deprecated nested mutations
 * (for instance `Article.rename`), kept on the types shared by `Query` and `Mutation`.
 * They are all deprecated with a reason like "Use renameArticle mutation at the root instead.".
 * The API conventions forbid adding new ones, so the deprecation reason identifies them all.
 */
const WRITE_FIELD_DEPRECATION = /mutation at the root/i

/**
 * @param {import('graphql').GraphQLField<unknown, unknown> | null | undefined} fieldDef
 * @returns {boolean}
 */
function isWriteField(fieldDef) {
  return WRITE_FIELD_DEPRECATION.test(fieldDef?.deprecationReason ?? '')
}

/**
 * Validation rule that rejects mutations and fields that write data.
 * It is added to the validation rules when the request is authenticated with a read-only token.
 *
 * @param {import('graphql').ValidationContext} context
 * @returns {import('graphql').ASTVisitor}
 */
function NoMutationRule(context) {
  return {
    OperationDefinition(node) {
      if (node.operation === 'mutation') {
        context.reportError(
          new GraphQLError(
            'Mutations are not allowed with a read-only token.',
            {
              nodes: [node],
              extensions: { code: 'FORBIDDEN' },
            }
          )
        )
      }
    },
    Field(node) {
      if (isWriteField(context.getFieldDef())) {
        const coordinate = `${context.getParentType()?.name}.${node.name.value}`
        context.reportError(
          new GraphQLError(
            `Field "${coordinate}" is not allowed with a read-only token.`,
            {
              nodes: [node],
              extensions: { code: 'FORBIDDEN' },
            }
          )
        )
      }
    },
  }
}

/**
 * @param {object|undefined} token decoded JWT
 * @returns {boolean}
 */
function isReadOnlyToken(token) {
  return token?.readonly === true
}

/**
 * Returns the validation rules to apply to a GraphQL request.
 * Signature expected by the `validationRules` option of graphql-http.
 *
 * @param {unknown} _req
 * @param {{ contextValue?: { token?: object } }} args
 * @param {readonly import('graphql').ValidationRule[]} specifiedRules
 * @returns {readonly import('graphql').ValidationRule[]}
 */
function validationRules(_req, args, specifiedRules) {
  if (isReadOnlyToken(args.contextValue?.token)) {
    return [...specifiedRules, NoMutationRule]
  }
  return specifiedRules
}

module.exports = {
  NoMutationRule,
  isWriteField,
  isReadOnlyToken,
  validationRules,
}
