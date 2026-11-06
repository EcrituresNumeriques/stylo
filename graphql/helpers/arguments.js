const { BadRequestError } = require('./errors.js')

/**
 * Return the first defined value among the candidates of a required argument.
 *
 * During the deprecation period of a renamed argument (or of an identifier moved out of an input type),
 * both the new and the deprecated forms are optional in the schema: this function checks that one of them is given.
 * The new form comes first, so it takes precedence over the deprecated one.
 *
 * @example
 * const input = requireArgument('input', args.input, args.createArticleInput)
 * const articleId = requireArgument('articleId', args.articleId, input.id)
 *
 * @param {string} name name of the argument (new form), used in the error message
 * @param {...any} candidates values of the new form, then of the deprecated forms
 * @returns {any} the first value that is neither null nor undefined
 * @throws {BadRequestError} when no value is given
 */
function requireArgument(name, ...candidates) {
  const value = candidates.find((v) => v !== undefined && v !== null)
  if (value === undefined) {
    throw new BadRequestError(
      'INVALID_INPUT',
      `Argument "${name}" is required.`
    )
  }
  return value
}

module.exports = { requireArgument }
