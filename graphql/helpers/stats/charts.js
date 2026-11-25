/**
 * Charts of /stats.svg, as described by the `@chart` and `@chartLabel`
 * directives of the GraphQL schema, on the fields of `InstanceUsageStats`.
 */

const {
  getNamedType,
  isEnumType,
  isListType,
  isNonNullType,
  isObjectType,
} = require('graphql')
const { getDirective } = require('@graphql-tools/utils')

const ROOT_TYPE = 'InstanceUsageStats'

/**
 * @typedef {'COLUMNS'|'PERCENT_BARS'|'SHARES'|'STACKED_COLUMNS'|'DISTRIBUTION'|'LINES'} ChartType
 */

/**
 * @typedef {object} Series
 * @property {string[]} path of the field, from `InstanceUsageStats`
 * @property {string} [label]
 * @property {boolean} list whether the field is a list
 * @property {string} [key] field of the items holding their key
 * @property {string} [value] field of the items holding their value
 * @property {string[]} [of] path of the total the values are a share of
 * @property {Map<string, string>} [keyLabels] labels of the keys
 * @property {{ name: string, label: string }[]} fields labelled fields of the values
 */

/**
 * @typedef {object} Chart
 * @property {string} id
 * @property {ChartType} type
 * @property {string} title
 * @property {Series[]} series
 */

/**
 * @param {import('graphql').GraphQLType} type
 * @returns {import('graphql').GraphQLType} the type, nullable
 */
const nullable = (type) => (isNonNullType(type) ? type.ofType : type)

/**
 * @param {import('graphql').GraphQLSchema} schema
 * @param {import('graphql').GraphQLField<any, any>|import('graphql').GraphQLEnumValue} node
 * @returns {{ text: string, order?: number }|undefined} the arguments of its `@chartLabel`
 */
const chartLabelOf = (schema, node) =>
  getDirective(schema, node, 'chartLabel')?.[0]

/**
 * @param {import('graphql').GraphQLSchema} schema
 * @param {import('graphql').GraphQLField<any, any>|import('graphql').GraphQLEnumValue} node
 * @returns {string|undefined} the text of its `@chartLabel`
 */
const labelOf = (schema, node) => chartLabelOf(schema, node)?.text

// the fields without order come after the others
const orderOf = ({ order }) => order ?? Number.MAX_SAFE_INTEGER

/**
 * @param {import('graphql').GraphQLObjectType} type
 * @param {string} name
 * @param {string} id of the chart, for the error message
 * @returns {import('graphql').GraphQLField<any, any>} the field
 */
function fieldOf(type, name, id) {
  const field = type.getFields()[name]
  if (!field) {
    throw new Error(`@chart(id: "${id}"): ${type.name} has no field ${name}`)
  }
  return field
}

/**
 * Lists the `@chart` directives of the fields of a type and of its object fields.
 * The lists are not walked through: a chart is on the list field itself.
 *
 * @param {import('graphql').GraphQLSchema} schema
 * @param {import('graphql').GraphQLObjectType} type
 * @param {string[]} path of the type, from the root type
 * @returns {{ args: object, field: import('graphql').GraphQLField<any, any>, path: string[] }[]}
 */
function directivesOf(schema, type, path) {
  return Object.values(type.getFields()).flatMap((field) => {
    const fieldPath = [...path, field.name]
    const own = (getDirective(schema, field, 'chart') ?? []).map((args) => ({
      args,
      field,
      path: fieldPath,
    }))
    const fieldType = nullable(field.type)
    const nested = isObjectType(fieldType)
      ? directivesOf(schema, fieldType, fieldPath)
      : []
    return [...own, ...nested]
  })
}

/**
 * @param {import('graphql').GraphQLSchema} schema
 * @param {string[]} path from the root type
 * @param {string} id of the chart, for the error message
 */
function assertPath(schema, path, id) {
  path.reduce((type, name) => {
    if (!isObjectType(type)) {
      throw new Error(`@chart(id: "${id}"): ${path.join('.')} is not a path`)
    }
    return nullable(fieldOf(type, name, id).type)
  }, schema.getType(ROOT_TYPE))
}

/**
 * @param {import('graphql').GraphQLSchema} schema
 * @param {string} name of an enum
 * @param {string} id of the chart, for the error message
 * @returns {Map<string, string>} the labels of its values
 */
function enumLabels(schema, name, id) {
  const type = schema.getType(name)
  if (!isEnumType(type)) {
    throw new Error(`@chart(id: "${id}"): ${name} is not an enum`)
  }
  return new Map(
    type
      .getValues()
      .map((value) => [value.name, labelOf(schema, value)])
      .filter(([, label]) => label)
  )
}

/**
 * @param {import('graphql').GraphQLSchema} schema
 * @param {{ args: object, field: import('graphql').GraphQLField<any, any>, path: string[] }} directive
 * @returns {Series & { title?: string, type: ChartType, valueType: import('graphql').GraphQLNamedType }}
 */
function seriesOf(schema, { args, field, path }) {
  const { id, type, title, label, key, value, of, labels } = args
  const list = isListType(nullable(field.type))
  const itemType = getNamedType(field.type)
  if (
    list !== Boolean(key) ||
    (value && !list) ||
    (list && !isObjectType(itemType))
  ) {
    throw new Error(
      `@chart(id: "${id}"): key and value are for a list of objects, which needs a key`
    )
  }
  if (key) {
    fieldOf(itemType, key, id)
  }
  const valueType = value
    ? getNamedType(fieldOf(itemType, value, id).type)
    : itemType
  const ofPath = of?.split('.')
  if (ofPath) {
    assertPath(schema, ofPath, id)
  }
  return {
    type,
    title,
    path,
    label,
    list,
    key,
    value,
    of: ofPath,
    keyLabels: labels ? enumLabels(schema, labels, id) : undefined,
    valueType,
    fields: [],
  }
}

/**
 * Reads the charts described by the `@chart` directives of the schema.
 *
 * @param {import('graphql').GraphQLSchema} schema
 * @returns {Chart[]} the charts, in the order of their first field in the schema
 */
function readCharts(schema) {
  /** @type {Map<string, ReturnType<typeof seriesOf>[]>} */
  const charts = new Map()
  for (const directive of directivesOf(schema, schema.getType(ROOT_TYPE), [])) {
    const { id } = directive.args
    charts.set(id, [...(charts.get(id) ?? []), seriesOf(schema, directive)])
  }
  return [...charts].map(([id, series]) => {
    const [{ type }] = series
    if (series.some((s) => s.type !== type)) {
      throw new Error(`@chart(id: "${id}"): the series have different types`)
    }
    const labels = new Map(
      series.flatMap(({ valueType }) =>
        isObjectType(valueType)
          ? Object.values(valueType.getFields())
              .map((field) => [field.name, chartLabelOf(schema, field)])
              .filter(([, label]) => label)
          : []
      )
    )
    return {
      id,
      type,
      title: series.find((s) => s.title)?.title ?? id,
      series: series.map(({ type, title, valueType, ...s }) => ({
        ...s,
        fields: isObjectType(valueType)
          ? Object.keys(valueType.getFields())
              .filter((name) => labels.has(name))
              .toSorted(
                (a, b) => orderOf(labels.get(a)) - orderOf(labels.get(b))
              )
              .map((name) => ({ name, label: labels.get(name).text }))
          : [],
      })),
    }
  })
}

/**
 * @param {object} stats
 * @param {string[]} path
 * @returns {any} the value at the path, undefined when missing
 */
const valueAt = (stats, path) =>
  path.reduce((value, name) => value?.[name], stats)

/**
 * @typedef {object} Item
 * @property {string|number} key
 * @property {string} label of the key
 * @property {any} value
 */

/**
 * @param {Series} series
 * @param {object} stats
 * @returns {any|Item[]} the value of the series; for a list, its items
 */
function seriesData(series, stats) {
  const data = valueAt(stats, series.path)
  if (!series.list) {
    return data
  }
  return (data ?? []).map((item) => {
    const key = item[series.key]
    return {
      key,
      label: series.keyLabels?.get(key) ?? String(key),
      value: series.value ? item[series.value] : item,
    }
  })
}

/**
 * @param {Series} series
 * @param {object} value of the series, or of one of its items
 * @returns {{ label: string, value: number }[]} its labelled fields
 */
const partsOf = (series, value) =>
  series.fields.map(({ name, label }) => ({ label, value: value?.[name] ?? 0 }))

module.exports = { partsOf, readCharts, seriesData, valueAt }
