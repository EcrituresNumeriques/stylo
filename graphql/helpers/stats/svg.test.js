const { describe, test } = require('node:test')
const assert = require('node:assert')

const {
  GENERATORS,
  chartSymbol,
  describeShares,
  escapeXml,
  formatMonth,
  formatNumber,
  formatShare,
  legend,
  niceCeil,
  renderStatsSprite,
  shareBar,
  symbol,
  ticksOf,
} = require('./svg.js')
const { readCharts } = require('./charts.js')
const schema = require('../../schema.js')

const BOX = { x: 0, y: 0, width: 100, height: 10 }
const count = (svg, pattern) => (svg.match(pattern) ?? []).length
const texts = (svg) =>
  [...svg.matchAll(/<text [^>]*>([^<]*)<\/text>/g)].map(([, text]) => text)

/**
 * @param {string} type
 * @param {object[]} series without the defaults
 * @returns {import('./charts.js').Chart}
 */
const chartOf = (type, series) => ({
  id: 'c',
  type,
  title: 'Titre',
  series: series.map((s) => ({ list: false, fields: [], ...s })),
})

const LEVELS = [
  { name: 'low', label: 'Bas' },
  { name: 'high', label: 'Haut' },
]

describe('escapeXml', () => {
  test('escapes the XML special characters', () => {
    assert.equal(
      escapeXml(`<a href="x">l'&</a>`),
      '&lt;a href=&quot;x&quot;&gt;l&apos;&amp;&lt;/a&gt;'
    )
  })

  test('converts numbers', () => {
    assert.equal(escapeXml(2026), '2026')
  })
})

describe('formatShare', () => {
  test('rounds to a whole percentage', () => {
    assert.equal(formatShare(0.456), '46 %')
  })

  test('shows 0 % for a null share', () => {
    assert.equal(formatShare(0), '0 %')
  })

  test('shows < 1 % for a tiny share, rather than 0 %', () => {
    assert.equal(formatShare(0.001), '< 1 %')
  })
})

describe('formatNumber', () => {
  test('separates the thousands, in French', () => {
    assert.equal(formatNumber(1273), '1 273')
  })

  test('keeps one decimal at most', () => {
    assert.equal(formatNumber(2.54), '2,5')
  })
})

describe('formatMonth', () => {
  test('writes the month in French', () => {
    assert.equal(formatMonth('2023-06'), 'juin 2023')
  })
})

describe('niceCeil', () => {
  test('rounds up to 1, 2 or 5 times a power of 10', () => {
    assert.equal(niceCeil(38), 50)
    assert.equal(niceCeil(14), 20)
    assert.equal(niceCeil(723), 1000)
    assert.equal(niceCeil(200), 200)
    assert.equal(niceCeil(3.2), 5)
  })

  test('is at least 1', () => {
    assert.equal(niceCeil(0), 1)
    assert.equal(niceCeil(0.3), 1)
    assert.equal(niceCeil(Number.NaN), 1)
  })
})

describe('ticksOf', () => {
  test('splits a scale in 5', () => {
    assert.deepEqual(ticksOf(50), [0, 10, 20, 30, 40, 50])
  })

  test('splits a scale starting with 2 in 4', () => {
    assert.deepEqual(ticksOf(20), [0, 5, 10, 15, 20])
  })
})

describe('shareBar', () => {
  test('draws an empty track when the total is 0', () => {
    const svg = shareBar([{ label: 'A', value: 0 }], BOX)
    assert.equal(count(svg, /<rect /g), 1)
    assert.match(svg, /fill="none"/)
  })

  test('draws an empty track when there are no parts', () => {
    assert.equal(count(shareBar([], BOX), /<rect /g), 1)
  })

  test('splits the bar proportionally, with a title and a color per part', () => {
    const svg = shareBar(
      [
        { label: 'A', value: 3 },
        { label: 'B', value: 1 },
      ],
      BOX
    )
    assert.match(
      svg,
      /<rect x="0" y="0" width="75" height="10" style="fill: var\(--stats-1, currentColor\)"><title>A : 75 %<\/title>/
    )
    assert.match(
      svg,
      /<rect x="75" y="0" width="25" height="10" style="fill: var\(--stats-2, currentColor\)"><title>B : 25 %<\/title>/
    )
  })

  test('skips the parts without value, keeping the colors of the others', () => {
    const svg = shareBar(
      [
        { label: 'A', value: 0 },
        { label: 'B', value: 1 },
      ],
      BOX
    )
    assert.doesNotMatch(svg, /A :/)
    assert.match(svg, /--stats-2/)
  })

  test('writes the percentage only in the segments wide enough', () => {
    const svg = shareBar(
      [
        { label: 'A', value: 95 },
        { label: 'B', value: 5 },
      ],
      BOX
    )
    assert.deepEqual(texts(svg), ['95 %'])
  })
})

describe('describeShares', () => {
  test('lists the parts with their shares', () => {
    assert.equal(
      describeShares([
        { label: 'Aucune activité', value: 1 },
        { label: 'HumanID', value: 3 },
      ]),
      'Aucune activité 25 %, HumanID 75 %'
    )
  })

  test('says when there is no data', () => {
    assert.equal(describeShares([{ label: 'A', value: 0 }]), 'aucune donnée')
  })
})

describe('legend', () => {
  test('is empty without label', () => {
    assert.deepEqual(legend([]), { content: '', height: 0 })
  })

  test('draws a swatch and a label per item, on one line when they fit', () => {
    const { content, height } = legend(['A', 'B'])
    assert.deepEqual(texts(content), ['A', 'B'])
    assert.match(content, /--stats-2/)
    assert.equal(height, 28)
  })

  test('wraps the items which do not fit', () => {
    const { content, height } = legend(['A'.repeat(50), 'B'.repeat(50)])
    assert.equal(height, 48)
    assert.match(content, /<text x="16" y="30"[^>]*>B+</)
  })
})

describe('symbol', () => {
  test('wraps the content with a title and a text alternative', () => {
    assert.equal(
      symbol(
        { id: 'x', title: 'T & co', description: 'D', height: 40 },
        '<g/>'
      ),
      '<symbol id="x" viewBox="0 0 600 40" font-size="13"><title>T &amp; co</title><desc>D</desc><g/></symbol>'
    )
  })
})

/**
 * @param {import('./charts.js').Chart} chart
 * @param {object} stats
 * @returns {import('./svg.js').Drawing}
 */
const draw = (chart, stats) => GENERATORS[chart.type](chart, stats)

const EMPTY = {
  content:
    '<text x="0" y="10" dominant-baseline="central" text-anchor="start" style="fill: currentColor">Aucune donnée</text>',
  height: 20,
  description: 'Titre : aucune donnée.',
}

describe('COLUMNS', () => {
  const chart = chartOf('COLUMNS', [
    { path: ['years'], list: true, key: 'year', value: 'created' },
  ])

  test('draws a column per item, with its value and its key', () => {
    const { content, height, description } = draw(chart, {
      years: [
        { year: 2025, created: 1000 },
        { year: 2026, created: 500 },
      ],
    })
    assert.equal(count(content, /<rect /g), 2)
    assert.match(content, /height="160"[^>]*><title>2025 : 1 000</)
    assert.match(content, /height="80"[^>]*><title>2026 : 500</)
    assert.deepEqual(texts(content), ['1 000', '2025', '500', '2026'])
    assert.equal(height, 200)
    assert.equal(description, 'Titre. 2025 : 1 000 ; 2026 : 500.')
  })

  test('draws no column for null values', () => {
    const { content } = draw(chart, { years: [{ year: 2025, created: 0 }] })
    assert.equal(count(content, /<rect /g), 0)
    assert.deepEqual(texts(content), ['0', '2025'])
  })

  test('has no data without item', () => {
    assert.deepEqual(draw(chart, { years: [] }), EMPTY)
  })
})

describe('STACKED_COLUMNS', () => {
  const chart = chartOf('STACKED_COLUMNS', [
    {
      path: ['activity'],
      list: true,
      key: 'year',
      value: 'seniority',
      fields: LEVELS,
    },
  ])

  test('stacks the labelled fields from the bottom, with the total on top', () => {
    const { content, height, description } = draw(chart, {
      activity: [
        { year: 2025, seniority: { low: 30, high: 10 } },
        { year: 2026, seniority: { low: 20, high: 0 } },
      ],
    })
    assert.match(
      content,
      /y="88" width="[^"]+" height="120" style="fill: var\(--stats-1[^>]*><title>Bas, 2025 : 30</
    )
    assert.match(
      content,
      /y="48" width="[^"]+" height="40" style="fill: var\(--stats-2[^>]*><title>Haut, 2025 : 10</
    )
    assert.doesNotMatch(content, /Haut, 2026/)
    assert.deepEqual(texts(content), [
      'Bas',
      'Haut',
      '40',
      '2025',
      '20',
      '2026',
    ])
    assert.equal(height, 228)
    assert.equal(
      description,
      'Titre. 2025 : 40, dont Bas 30, Haut 10 ; 2026 : 20, dont Bas 20, Haut 0.'
    )
  })

  test('has no data without item', () => {
    assert.deepEqual(draw(chart, { activity: [] }), EMPTY)
  })
})

describe('PERCENT_BARS', () => {
  const objectChart = chartOf('PERCENT_BARS', [
    { path: ['auth'], of: ['total'], fields: LEVELS },
  ])

  test('draws the labelled fields, from the largest, as shares of the total', () => {
    const { content, height, description } = draw(objectChart, {
      total: 20,
      auth: { low: 5, high: 10 },
    })
    assert.deepEqual(texts(content), ['Haut', '50 %', 'Bas', '25 %'])
    assert.match(content, /width="404"[^>]*><title>Haut : 10</)
    assert.match(content, /width="202"[^>]*><title>Bas : 5</)
    assert.equal(height, 48)
    assert.equal(description, 'Titre : Haut 50 %, Bas 25 %.')
  })

  test('draws the items of a list, as shares of their sum', () => {
    const { description } = draw(
      chartOf('PERCENT_BARS', [
        { path: ['types'], list: true, key: 'type', value: 'count' },
      ]),
      {
        types: [
          { type: 'a', count: 1 },
          { type: 'b', count: 3 },
        ],
      }
    )
    assert.equal(description, 'Titre : b 75 %, a 25 %.')
  })

  test('draws empty bars when every value is null', () => {
    const { content } = draw(objectChart, {
      total: 1,
      auth: { low: 0, high: 0 },
    })
    assert.equal(count(content, /width="0"/g), 2)
  })

  test('has no data when the total is null or missing', () => {
    assert.deepEqual(draw(objectChart, { total: 0, auth: {} }), EMPTY)
    assert.deepEqual(draw(objectChart, {}), EMPTY)
  })
})

describe('SHARES', () => {
  const chart = chartOf('SHARES', [
    { path: ['engagement'], fields: LEVELS },
    {
      path: ['engagement', 'years'],
      list: true,
      key: 'year',
      label: 'Par année',
      fields: LEVELS.toReversed(),
    },
  ])

  test('draws a bar for the object, then a row per item, under a legend', () => {
    const { content, height, description } = draw(chart, {
      engagement: {
        low: 1,
        high: 3,
        years: [
          { year: 2025, low: 1, high: 1 },
          { year: 2026, low: 0, high: 2 },
        ],
      },
    })
    assert.deepEqual(texts(content), [
      'Bas',
      'Haut',
      '25 %',
      '75 %',
      'Par année',
      '2025',
      '50 %',
      '50 %',
      '2026',
      '100 %',
    ])
    // the colors follow the legend, whatever the order of the fields of the series
    assert.match(content, /--stats-2, currentColor\)"><title>Haut : 100 %/)
    assert.equal(height, 152)
    assert.equal(
      description,
      'Titre : Bas 25 %, Haut 75 %. Par année, 2025 : Bas 50 %, Haut 50 % ; 2026 : Bas 0 %, Haut 100 %.'
    )
  })

  test('skips a list without item', () => {
    const { content, height, description } = draw(chart, {
      engagement: { low: 0, high: 0, years: [] },
    })
    assert.doesNotMatch(content, /Par année/)
    assert.equal(height, 60)
    assert.equal(description, 'Titre : aucune donnée.')
  })

  test('labels an object series with its label', () => {
    const { content, description } = draw(
      chartOf('SHARES', [{ path: ['a'], label: 'Série', fields: LEVELS }]),
      { a: { low: 1, high: 1 } }
    )
    assert.ok(texts(content).includes('Série'))
    assert.equal(description, 'Série : Bas 50 %, Haut 50 %.')
  })

  test('keeps the height of the legend when nothing is drawn', () => {
    const { height, description } = draw(
      chartOf('SHARES', [
        { path: ['a'], list: true, key: 'year', fields: LEVELS },
      ]),
      { a: [] }
    )
    assert.equal(height, 28)
    assert.equal(description, '')
  })
})

describe('DISTRIBUTION', () => {
  const chart = chartOf('DISTRIBUTION', [
    { path: ['a'], label: 'A' },
    { path: ['b'], label: 'B' },
    { path: ['c'] },
  ])

  test('draws a range per series and the median, on a common scale', () => {
    const { content, height, description } = draw(chart, {
      a: { p10: 1, median: 5, p90: 38, max: 5890 },
      b: { p10: 2, median: 2, p90: 2, max: 19 },
      c: { p10: 0, median: 20, p90: 40, max: 90 },
    })
    // 38 → scale of 50
    assert.match(
      content,
      /x="12" y="20" width="444"[^>]*><title>A : de 1 à 38, au plus 5 890</
    )
    assert.match(
      content,
      /x="59" y="16" width="2" height="28" style="fill: var\(--stats-median, #000\); stroke: var\(--stats-median-outline, #fff\); stroke-width: 4; paint-order: stroke; filter: drop-shadow\(0 0 1px var\(--stats-median-shadow, #777\)\)"><title>Médiane : 5</
    )
    // a narrow range keeps a visible width
    assert.match(content, /width="2" height="20"[^>]*><title>B : de 2 à 2/)
    assert.match(
      content,
      /x="0" y="116" width="480"[^>]*><title>Titre : de 0 à 40/
    )
    assert.match(content, /x="239" y="112"/)
    assert.deepEqual(texts(content).slice(-6), [
      '0',
      '10',
      '20',
      '30',
      '40',
      '50',
    ])
    assert.match(content, /text-anchor="start"[^>]*>0</)
    assert.match(content, /text-anchor="end"[^>]*>50</)
    assert.equal(height, 164)
    assert.equal(
      description,
      'Titre. A : médiane 5, 9 sur 10 38 ou moins, au plus 5 890. B : médiane 2, 9 sur 10 2 ou moins, au plus 19. Titre : médiane 20, 9 sur 10 40 ou moins, au plus 90.'
    )
  })

  test('says when a series has no data', () => {
    const { content, description } = draw(chart, {
      a: { p10: 1, median: 1, p90: 1, max: 1 },
      b: { p10: null, median: null, p90: null, max: null },
    })
    assert.equal(count(content, />Aucune donnée</g), 2)
    assert.match(description, /B : aucune donnée\. Titre : aucune donnée\.$/)
  })

  test('has no data when no series has', () => {
    assert.deepEqual(draw(chart, {}), EMPTY)
  })
})

describe('LINES', () => {
  const chart = chartOf('LINES', [
    {
      path: ['corpora'],
      list: true,
      key: 'month',
      value: 'total',
      label: 'Corpus',
    },
    {
      path: ['workspaces'],
      list: true,
      key: 'month',
      value: 'total',
      label: 'Espaces',
    },
  ])

  test('draws a line per series over the months, with a legend and a grid', () => {
    const { content, height, description } = draw(chart, {
      corpora: [
        { month: '2023-12', total: 5 },
        { month: '2024-01', total: 10 },
        { month: '2024-02', total: 15 },
      ],
      workspaces: [{ month: '2024-02', total: 4 }],
    })
    assert.match(
      content,
      /<polyline points="48,186 320,136 592,86" [^>]*style="stroke: var\(--stats-1[^>]*><title>Corpus</
    )
    assert.match(content, /<polyline points="592,196" [^>]*--stats-2/)
    // a scale of 20: 4 steps
    assert.equal(count(content, /height="1"/g), 5)
    assert.deepEqual(texts(content), [
      'Corpus',
      'Espaces',
      '0',
      '5',
      '10',
      '15',
      '20',
      'décembre 2023',
      '2024',
    ])
    assert.equal(height, 260)
    assert.equal(
      description,
      'Titre. Corpus : de 5 en décembre 2023 à 15 en février 2024 ; Espaces : de 4 en février 2024 à 4 en février 2024.'
    )
  })

  test('skips the labels too close to the previous one', () => {
    const months = Array.from({ length: 30 }, (_, index) => ({
      month: `${2023 + Math.floor((index + 11) / 12)}-${String(((index + 11) % 12) + 1).padStart(2, '0')}`,
      total: index,
    }))
    const { content } = draw(chart, { corpora: months, workspaces: [] })
    assert.deepEqual(texts(content).slice(-3), [
      'décembre 2023',
      '2025',
      '2026',
    ])
  })

  test('labels every key which is not a month', () => {
    const { content } = draw(
      chartOf('LINES', [{ path: ['a'], list: true, key: 'k', value: 'v' }]),
      { a: [{ k: 'x', v: 1 }] }
    )
    assert.match(content, /<polyline points="48,36"/)
    assert.deepEqual(texts(content).slice(-1), ['x'])
  })

  test('says when a series has no data', () => {
    const { description } = draw(chart, {
      corpora: [{ month: '2024-01', total: 1 }],
      workspaces: [],
    })
    assert.match(description, /Espaces : aucune donnée\.$/)
  })

  test('has no data without item', () => {
    assert.deepEqual(draw(chart, { corpora: [], workspaces: [] }), EMPTY)
  })
})

describe('chartSymbol', () => {
  test('draws the chart in a symbol, with its title and its description', () => {
    const svg = chartSymbol(
      chartOf('COLUMNS', [{ path: ['a'], list: true, key: 'k' }]),
      {}
    )
    assert.equal(
      svg,
      `<symbol id="c" viewBox="0 0 600 20" font-size="13"><title>Titre</title><desc>Titre : aucune donnée.</desc>${EMPTY.content}</symbol>`
    )
  })
})

describe('renderStatsSprite', () => {
  test('holds a symbol per chart', () => {
    const chart = chartOf('COLUMNS', [{ path: ['a'], list: true, key: 'k' }])
    const svg = renderStatsSprite({}, [chart, { ...chart, id: 'd' }])
    assert.match(
      svg,
      /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"><symbol id="c" .*<symbol id="d" .*<\/svg>\n$/
    )
  })

  test('draws every chart of the schema, even without data', () => {
    const svg = renderStatsSprite(
      { users: { total: 0 }, engagement: {} },
      readCharts(schema)
    )
    assert.equal(count(svg, /<symbol /g), 10)
    assert.equal(count(svg, /<desc>/g), 10)
  })

  test('is empty without chart', () => {
    assert.equal(
      renderStatsSprite({}, []),
      '<svg xmlns="http://www.w3.org/2000/svg"></svg>\n'
    )
  })
})
