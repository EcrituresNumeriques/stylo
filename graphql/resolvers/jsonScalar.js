// copied/pasted from https://github.com/taion/graphql-type-json/blob/10418fa03875947140d1c0bd8b8de51926252e35/src/index.js
const { GraphQLScalarType } = require('graphql')
const { Kind, print } = require('graphql/language')

function identity(value) {
  return value
}

function ensureObject(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError(
      `JSONObject cannot represent non-object value: ${value}`
    )
  }

  return value
}

function parseObject(typeName, ast, variables) {
  const value = Object.create(null)
  ast.fields.forEach((field) => {
    // eslint-disable-next-line no-use-before-define
    value[field.name.value] = parseLiteral(typeName, field.value, variables)
  })

  return value
}

function parseLiteral(typeName, ast, variables) {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value)
    case Kind.OBJECT:
      return parseObject(typeName, ast, variables)
    case Kind.LIST:
      return ast.values.map((n) => parseLiteral(typeName, n, variables))
    case Kind.NULL:
      return null
    case Kind.VARIABLE:
      return variables ? variables[ast.name.value] : undefined
    default:
      throw new TypeError(`${typeName} cannot represent value: ${print(ast)}`)
  }
}

module.exports = {
  GraphQLJSON: new GraphQLScalarType({
    name: 'JSON',
    description:
      'The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).',
    specifiedByUrl:
      'https://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf',
    serialize: identity,
    parseValue: identity,
    parseLiteral: (ast, variables) => parseLiteral('JSON', ast, variables),
  }),
  GraphQLJSONObject: new GraphQLScalarType({
    name: 'JSONObject',
    description:
      'The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).',
    specifiedByUrl:
      'https://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf',
    serialize: ensureObject,
    parseValue: ensureObject,
    parseLiteral: (ast, variables) => {
      if (ast.kind !== Kind.OBJECT) {
        throw new TypeError(
          `JSONObject cannot represent non-object value: ${print(ast)}`
        )
      }

      return parseObject('JSONObject', ast, variables)
    },
  }),
}
