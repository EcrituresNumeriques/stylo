const { describe, test } = require('node:test')
const assert = require('node:assert')
const { buildSchema, print } = require('graphql')

const { partsOf, readCharts, seriesData, valueAt } = require('./charts.js')
const schema = require('../../schema.js')

// the declarations of the directives, from the schema of the API
const DECLARATIONS = [
  schema.getDirective('chart'),
  schema.getDirective('chartLabel'),
  schema.getType('ChartType'),
]
  .map(({ astNode }) => print(astNode))
  .join('\n')

/**
 * @param {string} typeDefs of `InstanceUsageStats` and its types
 * @returns {import('graphql').GraphQLSchema}
 */
const schemaOf = (typeDefs) =>
  buildSchema(
    `${DECLARATIONS}\ntype Query { stats: InstanceUsageStats }\n${typeDefs}`
  )

describe('readCharts', () => {
  const charts = readCharts(
    schemaOf(`
      type InstanceUsageStats {
        total: Int!
        "not drawn"
        version: String
        levels: Levels! @chart(id: "levels", type: SHARES, title: "Niveaux")
        nested: Nested!
        years: [Year!]! @chart(id: "years", type: COLUMNS, title: "Par année", key: "year", value: "count")
          @chart(id: "levels", type: SHARES, label: "Par année", key: "year", value: "levels")
        types: [Type!]! @chart(id: "types", type: PERCENT_BARS, key: "type", value: "count", labels: "Kind", of: "nested.total")
      }
      type Levels {
        low: Int! @chartLabel(text: "Bas")
        high: Int! @chartLabel(text: "Haut")
        unlabelled: Int!
      }
      type YearLevels {
        high: Int!
        low: Int!
        other: Int!
      }
      type Year { year: Int!, count: Int!, levels: YearLevels! }
      type Type { type: String!, count: Int! }
      type Nested { total: Int!, size: Distribution! @chart(id: "sizes", type: DISTRIBUTION, label: "Taille") }
      type Distribution { median: Float }
      enum Kind { a @chartLabel(text: "A"), b }
    `)
  )
  const byId = Object.fromEntries(charts.map((chart) => [chart.id, chart]))

  test('groups the directives by chart, in the order of the schema', () => {
    assert.deepEqual(
      charts.map(({ id, type }) => [id, type]),
      [
        ['levels', 'SHARES'],
        ['sizes', 'DISTRIBUTION'],
        ['years', 'COLUMNS'],
        ['types', 'PERCENT_BARS'],
      ]
    )
  })

  test('reads the series of a repeated directive', () => {
    const [overall, perYear] = byId.levels.series
    assert.deepEqual(overall.path, ['levels'])
    assert.equal(overall.list, false)
    assert.deepEqual(perYear.path, ['years'])
    assert.equal(perYear.list, true)
    assert.equal(perYear.label, 'Par année')
    assert.equal(perYear.key, 'year')
    assert.equal(perYear.value, 'levels')
  })

  test('labels the fields of the values, shared by name between the series', () => {
    const expected = [
      { name: 'low', label: 'Bas' },
      { name: 'high', label: 'Haut' },
    ]
    assert.deepEqual(byId.levels.series[0].fields, expected)
    // in the order of the fields of YearLevels
    assert.deepEqual(byId.levels.series[1].fields, expected.toReversed())
  })

  test('orders the fields by the order of their labels, the others last', () => {
    const [chart] = readCharts(
      schemaOf(`
        type InstanceUsageStats { a: A! @chart(id: "a", type: SHARES) }
        type A {
          first: Int! @chartLabel(text: "Sans ordre")
          second: Int! @chartLabel(text: "Deux", order: 2)
          third: Int! @chartLabel(text: "Un", order: 1)
        }
      `)
    )
    assert.deepEqual(
      chart.series[0].fields.map(({ label }) => label),
      ['Un', 'Deux', 'Sans ordre']
    )
  })

  test('reads the directives of the nested object fields', () => {
    assert.deepEqual(byId.sizes.series[0].path, ['nested', 'size'])
    assert.equal(byId.sizes.series[0].label, 'Taille')
  })

  test('takes the title of the series which has one, the id otherwise', () => {
    assert.equal(byId.levels.title, 'Niveaux')
    assert.equal(byId.sizes.title, 'sizes')
  })

  test('has no labelled fields for values which are not objects', () => {
    assert.deepEqual(byId.years.series[0].fields, [])
  })

  test('reads the path of the total and the labels of the keys', () => {
    const [series] = byId.types.series
    assert.deepEqual(series.of, ['nested', 'total'])
    assert.deepEqual([...series.keyLabels], [['a', 'A']])
  })

  test('finds no chart in a schema without directive', () => {
    assert.deepEqual(
      readCharts(schemaOf('type InstanceUsageStats { total: Int! }')),
      []
    )
  })

  const invalid = {
    'a key on an object': 'a: A! @chart(id: "x", type: SHARES, key: "b")',
    'a value on an object': 'a: A! @chart(id: "x", type: SHARES, value: "b")',
    'a list without key': 'a: [A!]! @chart(id: "x", type: COLUMNS)',
    'a list of scalars': 'a: [Int!]! @chart(id: "x", type: COLUMNS, key: "b")',
    'an unknown key': 'a: [A!]! @chart(id: "x", type: COLUMNS, key: "c")',
    'an unknown value':
      'a: [A!]! @chart(id: "x", type: COLUMNS, key: "b", value: "c")',
    'an unknown total': 'a: A! @chart(id: "x", type: SHARES, of: "a.c")',
    'a total under a scalar':
      'a: A! @chart(id: "x", type: SHARES, of: "a.b.c")',
    'labels which are not an enum':
      'a: [A!]! @chart(id: "x", type: COLUMNS, key: "b", labels: "A")',
    'series of different types':
      'a: A! @chart(id: "x", type: SHARES) @chart(id: "x", type: LINES)',
  }
  for (const [name, field] of Object.entries(invalid)) {
    test(`rejects ${name}`, () => {
      assert.throws(
        () =>
          readCharts(
            schemaOf(`type InstanceUsageStats { ${field} } type A { b: Int! }`)
          ),
        /^Error: @chart\(id: "x"\)/
      )
    })
  }
})

describe('valueAt', () => {
  test('returns the value at the path', () => {
    assert.equal(valueAt({ a: { b: 1 } }, ['a', 'b']), 1)
  })

  test('returns undefined for a missing path', () => {
    assert.equal(valueAt({ a: null }, ['a', 'b']), undefined)
  })
})

describe('seriesData', () => {
  test('returns the value of an object series', () => {
    assert.deepEqual(
      seriesData({ path: ['a'], list: false }, { a: { b: 1 } }),
      {
        b: 1,
      }
    )
  })

  test('returns the items of a list, with their key, label and value', () => {
    const series = {
      path: ['a'],
      list: true,
      key: 'type',
      value: 'count',
      keyLabels: new Map([['x', 'X']]),
    }
    assert.deepEqual(
      seriesData(series, {
        a: [
          { type: 'x', count: 1 },
          { type: 'y', count: 2 },
        ],
      }),
      [
        { key: 'x', label: 'X', value: 1 },
        { key: 'y', label: 'y', value: 2 },
      ]
    )
  })

  test('takes the item as value when no value field is given', () => {
    const item = { year: 2026, a: 1 }
    assert.deepEqual(
      seriesData({ path: ['a'], list: true, key: 'year' }, { a: [item] }),
      [{ key: 2026, label: '2026', value: item }]
    )
  })

  test('returns no item for a missing list', () => {
    assert.deepEqual(seriesData({ path: ['a'], list: true, key: 'k' }, {}), [])
  })
})

describe('partsOf', () => {
  const series = { fields: [{ name: 'a', label: 'A' }] }

  test('returns the labelled fields of a value', () => {
    assert.deepEqual(partsOf(series, { a: 2, b: 3 }), [
      { label: 'A', value: 2 },
    ])
  })

  test('counts a missing value as 0', () => {
    assert.deepEqual(partsOf(series, null), [{ label: 'A', value: 0 }])
  })
})

describe('the charts of the schema', () => {
  test('are the charts of /stats.svg', () => {
    assert.deepEqual(
      readCharts(schema).map(({ id }) => id),
      [
        'authentication',
        'accounts-created',
        'article-details',
        'metadata-levels',
        'writing-durations',
        'active-seniority',
        'engagement',
        'sizes',
        'corpus-types',
        'monthly-totals',
      ]
    )
  })
})
