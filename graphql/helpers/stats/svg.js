/**
 * SVG charts of the instance usage stats, served as `<symbol>`s
 * and displayed by the /stats page with `<svg><use href="…#id"/></svg>`.
 *
 * The charts are described by the `@chart` directives of the schema (see `charts.js`):
 * there is one generator per type of chart.
 *
 * Colors are CSS variables (`--stats-1`, `--stats-2`…, then `currentColor`;
 * `--stats-on-fill` for the texts on the bars, `--stats-median`, `--stats-median-outline`
 * and `--stats-median-shadow` for the medians):
 * they are inherited by the content of `<use>`, so the page keeps control of them.
 * Texts are in French.
 */

const { partsOf, seriesData, valueAt } = require('./charts.js')

const WIDTH = 600
const FONT_SIZE = 13
// average width of a character, to lay out the texts
const CHAR_WIDTH = 7.5
const LABEL_WIDTH = 56
const BAR_HEIGHT = 32
const ROW_HEIGHT = 20
const GAP = 8
const SWATCH_SIZE = 12
const COLUMNS_HEIGHT = 160
const LINES_HEIGHT = 200
const AXIS_WIDTH = 48
const PERCENT_LABEL_WIDTH = 140
const PERCENT_VALUE_WIDTH = 56
// the median: a black line, outlined in white (the stroke is drawn under the fill)
// and slightly shadowed, to stand out on the bars as on the background
const MEDIAN_FILL =
  'var(--stats-median, #000); stroke: var(--stats-median-outline, #fff); stroke-width: 4; paint-order: stroke; filter: drop-shadow(0 0 1px var(--stats-median-shadow, #777))'
// below this share, a segment is too narrow to hold its percentage
const MIN_LABELLED_SHARE = 0.08

const XML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

/**
 * @param {string|number} value
 * @returns {string} the value, safe to be used in a text node or an attribute
 */
function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (char) => XML_ENTITIES[char])
}

/**
 * @param {number} share between 0 and 1
 * @returns {string} the share as a rounded percentage, `< 1 %` when not null
 */
function formatShare(share) {
  if (share > 0 && share < 0.005) {
    return '< 1 %'
  }
  return `${Math.round(share * 100)} %`
}

const numberFormat = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 1,
})

/**
 * @param {number} value
 * @returns {string} the value, in French (`1 273`, `2,5`)
 */
const formatNumber = (value) => numberFormat.format(value)

const monthFormat = new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

/**
 * @param {string} month as YYYY-MM
 * @returns {string} the month, in French (`juin 2023`)
 */
const formatMonth = (month) => monthFormat.format(new Date(`${month}-01`))

const isMonth = (key) => /^\d{4}-\d{2}$/.test(key)

/**
 * @param {number} index of the series, from 0
 * @returns {string} the color of the series
 */
const colorOf = (index) => `var(--stats-${index + 1}, currentColor)`

/**
 * @param {number} index of the line, from 0
 * @returns {string} every other color of the series: close lines need distinct colors
 */
const lineColorOf = (index) => colorOf(index * 2)

const round = (value) => Math.round(value * 10) / 10

const sum = (values) => values.reduce((total, value) => total + value, 0)

/**
 * @param {number} value
 * @returns {number} the smallest 1, 2 or 5 × 10^n at least equal to the value (1 at least)
 */
function niceCeil(value) {
  if (!(value > 1)) {
    return 1
  }
  const power = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 5, 10].find((step) => step * power >= value)
  return step * power
}

/**
 * @param {number} scale as returned by `niceCeil`
 * @returns {number[]} the ticks of an axis, from 0 to the scale
 */
function ticksOf(scale) {
  const leading = scale / 10 ** Math.floor(Math.log10(scale))
  const count = leading === 2 ? 4 : 5
  return Array.from({ length: count + 1 }, (_, index) =>
    round((scale * index) / count)
  )
}

/**
 * @param {number} x
 * @param {number} y of the middle of the text
 * @param {string|number} content
 * @param {string} [anchor] start, middle or end
 * @returns {string} a `<text>`
 */
const text = (x, y, content, anchor = 'start') =>
  `<text x="${round(x)}" y="${round(y)}" dominant-baseline="central" text-anchor="${anchor}" style="fill: currentColor">${escapeXml(content)}</text>`

/**
 * @param {{ x: number, y: number, width: number, height: number }} box
 * @param {string} fill
 * @param {string} [title]
 * @returns {string} a `<rect>`
 */
const rect = ({ x, y, width, height }, fill, title) =>
  `<rect x="${round(x)}" y="${round(y)}" width="${round(width)}" height="${round(height)}" style="fill: ${fill}">${title ? `<title>${escapeXml(title)}</title>` : ''}</rect>`

/**
 * @typedef {object} Part
 * @property {string} label
 * @property {number} value
 */

/**
 * A horizontal bar split in parts proportional to their values (100 % stacked).
 *
 * @param {Part[]} parts
 * @param {{ x: number, y: number, width: number, height: number }} box
 * @returns {string} the SVG elements of the bar, an empty track when the total is 0
 */
function shareBar(parts, { x, y, width, height }) {
  const total = sum(parts.map(({ value }) => value))
  const track = `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="none" stroke="currentColor" stroke-opacity="0.2"/>`
  if (total === 0) {
    return track
  }
  let offset = x
  const segments = parts.map(({ label, value }, index) => {
    const share = value / total
    const segmentWidth = share * width
    const start = offset
    offset += segmentWidth
    if (value === 0) {
      return ''
    }
    const segment = rect(
      { x: start, y, width: segmentWidth, height },
      colorOf(index),
      `${label} : ${formatShare(share)}`
    )
    if (share < MIN_LABELLED_SHARE) {
      return segment
    }
    const percentage = `<text x="${round(start + segmentWidth / 2)}" y="${round(y + height / 2)}" dominant-baseline="central" text-anchor="middle" style="fill: var(--stats-on-fill, #fff)">${formatShare(share)}</text>`
    return segment + percentage
  })
  return track + segments.join('')
}

/**
 * @param {Part[]} parts
 * @returns {string} the parts and their shares, as a sentence
 */
function describeShares(parts) {
  const total = sum(parts.map(({ value }) => value))
  if (total === 0) {
    return 'aucune donnée'
  }
  return parts
    .map(({ label, value }) => `${label} ${formatShare(value / total)}`)
    .join(', ')
}

/**
 * A legend of colored swatches, wrapped on several lines when needed.
 *
 * @param {string[]} labels
 * @param {(index: number) => string} [colorAt] color of the item at an index
 * @returns {{ content: string, height: number }} the legend, 0 high when there is no label
 */
function legend(labels, colorAt = colorOf) {
  let x = 0
  let y = 0
  const items = labels.map((label, index) => {
    const width = SWATCH_SIZE + GAP + label.length * CHAR_WIDTH
    if (x > 0 && x + width > WIDTH) {
      x = 0
      y += ROW_HEIGHT
    }
    const item =
      rect(
        {
          x,
          y: y + (ROW_HEIGHT - SWATCH_SIZE) / 2,
          width: SWATCH_SIZE,
          height: SWATCH_SIZE,
        },
        colorAt(index)
      ) + text(x + SWATCH_SIZE + GAP / 2, y + ROW_HEIGHT / 2, label)
    x += width + GAP * 2
    return item
  })
  return {
    content: items.join(''),
    height: labels.length > 0 ? y + ROW_HEIGHT + GAP : 0,
  }
}

/**
 * @param {{ id: string, title: string, description: string, height: number }} options
 * @param {string} content SVG elements
 * @returns {string} the `<symbol>`, with its title and its text alternative
 */
function symbol({ id, title, description, height }, content) {
  return `<symbol id="${escapeXml(id)}" viewBox="0 0 ${WIDTH} ${round(height)}" font-size="${FONT_SIZE}"><title>${escapeXml(title)}</title><desc>${escapeXml(description)}</desc>${content}</symbol>`
}

/**
 * @typedef {import('./charts.js').Chart} Chart
 * @typedef {{ content: string, height: number, description: string }} Drawing
 */

/**
 * @param {Chart} chart
 * @returns {Drawing} a chart without data
 */
const empty = ({ title }) => ({
  content: text(0, ROW_HEIGHT / 2, 'Aucune donnée'),
  height: ROW_HEIGHT,
  description: `${title} : aucune donnée.`,
})

/**
 * @param {Chart} chart
 * @returns {{ name: string, label: string }[]} the labelled fields of its series, by name
 */
function fieldsOf({ series }) {
  const fields = new Map(
    series.flatMap(({ fields }) => fields.map((field) => [field.name, field]))
  )
  return [...fields.values()]
}

/**
 * Vertical columns, one per item of the list of the first series.
 *
 * @param {Chart} chart
 * @param {object} stats
 * @param {(item: import('./charts.js').Item) => Part[]} partsOfItem the stacked parts of an item
 * @param {string[]} labels of the legend
 * @returns {Drawing}
 */
function drawColumns(chart, stats, partsOfItem, labels) {
  const items = seriesData(chart.series[0], stats)
  if (items.length === 0) {
    return empty(chart)
  }
  const { content: legendContent, height: legendHeight } = legend(labels)
  const totals = items.map((item) => sum(partsOfItem(item).map((p) => p.value)))
  const max = Math.max(...totals)
  const top = legendHeight + ROW_HEIGHT
  const slot = WIDTH / items.length
  const columns = items.map((item, index) => {
    const x = index * slot
    const barX = x + slot * 0.15
    let bottom = top + COLUMNS_HEIGHT
    const segments = partsOfItem(item).map(({ label, value }, partIndex) => {
      const height = max > 0 ? (value / max) * COLUMNS_HEIGHT : 0
      bottom -= height
      if (value === 0) {
        return ''
      }
      return rect(
        { x: barX, y: bottom, width: slot * 0.7, height },
        colorOf(partIndex),
        `${label ? `${label}, ` : ''}${item.label} : ${formatNumber(value)}`
      )
    })
    return (
      segments.join('') +
      text(
        x + slot / 2,
        bottom - ROW_HEIGHT / 2,
        formatNumber(totals[index]),
        'middle'
      ) +
      text(
        x + slot / 2,
        top + COLUMNS_HEIGHT + ROW_HEIGHT / 2,
        item.label,
        'middle'
      )
    )
  })
  const descriptions = items.map((item, index) => {
    const parts = partsOfItem(item).filter(({ label }) => label)
    const detail =
      parts.length > 0
        ? `, dont ${parts.map(({ label, value }) => `${label} ${formatNumber(value)}`).join(', ')}`
        : ''
    return `${item.label} : ${formatNumber(totals[index])}${detail}`
  })
  return {
    content: legendContent + columns.join(''),
    height: top + COLUMNS_HEIGHT + ROW_HEIGHT,
    description: `${chart.title}. ${descriptions.join(' ; ')}.`,
  }
}

/**
 * COLUMNS: one column per item of the list of the first series.
 *
 * @param {Chart} chart
 * @param {object} stats
 * @returns {Drawing}
 */
const columns = (chart, stats) =>
  drawColumns(chart, stats, ({ value }) => [{ label: '', value }], [])

/**
 * STACKED_COLUMNS: one column per item of the list of the first series,
 * split in the labelled fields of the items, from the bottom.
 *
 * @param {Chart} chart
 * @param {object} stats
 * @returns {Drawing}
 */
function stackedColumns(chart, stats) {
  const fields = fieldsOf(chart)
  return drawColumns(
    chart,
    stats,
    ({ value }) => partsOf({ fields }, value),
    fields.map(({ label }) => label)
  )
}

/**
 * PERCENT_BARS: one bar per value, from the largest, with its share of the total.
 * The values are the items of the lists and the labelled fields of the objects.
 *
 * @param {Chart} chart
 * @param {object} stats
 * @returns {Drawing}
 */
function percentBars(chart, stats) {
  const parts = chart.series
    .flatMap((series) => {
      const data = seriesData(series, stats)
      return series.list
        ? data.map(({ label, value }) => ({ label, value }))
        : partsOf(series, data)
    })
    .toSorted((a, b) => b.value - a.value)
  const ofSeries = chart.series.find(({ of }) => of)
  const total = ofSeries
    ? valueAt(stats, ofSeries.of)
    : sum(parts.map(({ value }) => value))
  if (!(total > 0)) {
    return empty(chart)
  }
  const max = Math.max(...parts.map(({ value }) => value))
  const barWidth = WIDTH - PERCENT_LABEL_WIDTH - PERCENT_VALUE_WIDTH
  const rows = parts.map(({ label, value }, index) => {
    const y = index * (ROW_HEIGHT + GAP)
    const share = formatShare(value / total)
    return (
      text(0, y + ROW_HEIGHT / 2, label) +
      rect(
        {
          x: PERCENT_LABEL_WIDTH,
          y,
          width: max > 0 ? (value / max) * barWidth : 0,
          height: ROW_HEIGHT,
        },
        colorOf(0),
        `${label} : ${formatNumber(value)}`
      ) +
      text(WIDTH, y + ROW_HEIGHT / 2, share, 'end')
    )
  })
  const shares = parts.map(
    ({ label, value }) => `${label} ${formatShare(value / total)}`
  )
  return {
    content: rows.join(''),
    height: parts.length * (ROW_HEIGHT + GAP) - GAP,
    description: `${chart.title} : ${shares.join(', ')}.`,
  }
}

/**
 * SHARES: a bar split in the shares of the labelled fields, for an object series,
 * and one such bar per item for a list series.
 *
 * @param {Chart} chart
 * @param {object} stats
 * @returns {Drawing}
 */
function shares(chart, stats) {
  const fields = fieldsOf(chart)
  const { content: legendContent, height: legendHeight } = legend(
    fields.map(({ label }) => label)
  )
  let y = legendHeight
  const blocks = chart.series.map((series) => {
    const data = seriesData(series, stats)
    if (series.list && data.length === 0) {
      return { content: '', description: '' }
    }
    const heading = series.label
      ? text(0, y + ROW_HEIGHT / 2, series.label)
      : ''
    y += series.label ? ROW_HEIGHT + GAP : 0
    const name = series.label ?? chart.title
    if (!series.list) {
      const parts = partsOf({ fields }, data)
      const bar = shareBar(parts, { x: 0, y, width: WIDTH, height: BAR_HEIGHT })
      y += BAR_HEIGHT + GAP * 2
      return {
        content: heading + bar,
        description: `${name} : ${describeShares(parts)}.`,
      }
    }
    const rows = data.map(({ label, value }) => {
      const parts = partsOf({ fields }, value)
      const row =
        text(0, y + ROW_HEIGHT / 2, label) +
        shareBar(parts, {
          x: LABEL_WIDTH,
          y,
          width: WIDTH - LABEL_WIDTH,
          height: ROW_HEIGHT,
        })
      y += ROW_HEIGHT + GAP
      return { row, description: `${label} : ${describeShares(parts)}` }
    })
    y += GAP
    return {
      content: heading + rows.map(({ row }) => row).join(''),
      description: `${name}, ${rows.map(({ description }) => description).join(' ; ')}.`,
    }
  })
  return {
    content: legendContent + blocks.map(({ content }) => content).join(''),
    height: Math.max(y - GAP * 2, legendHeight),
    description: blocks
      .map(({ description }) => description)
      .filter(Boolean)
      .join(' '),
  }
}

/**
 * DISTRIBUTION: one row per series, a range from the 10th to the 90th percentile
 * with the median, on a common scale.
 *
 * @param {Chart} chart
 * @param {object} stats
 * @returns {Drawing}
 */
function distributions(chart, stats) {
  const rows = chart.series.map((series) => ({
    label: series.label ?? chart.title,
    distribution: seriesData(series, stats),
  }))
  const known = rows.filter(({ distribution }) => distribution?.median != null)
  if (known.length === 0) {
    return empty(chart)
  }
  const scale = niceCeil(
    Math.max(...known.map(({ distribution }) => distribution.p90))
  )
  const x = (value) => (value / scale) * WIDTH
  const rowHeight = ROW_HEIGHT * 2 + GAP
  const content = rows.map(({ label, distribution }, index) => {
    const y = index * rowHeight
    const heading = text(0, y + ROW_HEIGHT / 2, label)
    const barY = y + ROW_HEIGHT
    if (distribution?.median == null) {
      return heading + text(0, barY + ROW_HEIGHT / 2, 'Aucune donnée')
    }
    const { p10, median, p90, max } = distribution
    const range = rect(
      {
        x: x(p10),
        y: barY,
        width: Math.max(x(p90) - x(p10), 2),
        height: ROW_HEIGHT,
      },
      colorOf(0),
      `${label} : de ${formatNumber(p10)} à ${formatNumber(p90)}, au plus ${formatNumber(max)}`
    )
    const medianMark = rect(
      { x: x(median) - 1, y: barY - 4, width: 2, height: ROW_HEIGHT + 8 },
      MEDIAN_FILL,
      `Médiane : ${formatNumber(median)}`
    )
    return heading + range + medianMark
  })
  const axisY = rows.length * rowHeight + ROW_HEIGHT / 2
  const ticks = ticksOf(scale).map((tick, index, all) => {
    const anchor =
      index === 0 ? 'start' : index === all.length - 1 ? 'end' : 'middle'
    return text(x(tick), axisY, formatNumber(tick), anchor)
  })
  const descriptions = rows.map(({ label, distribution }) =>
    distribution?.median == null
      ? `${label} : aucune donnée`
      : `${label} : médiane ${formatNumber(distribution.median)}, 9 sur 10 ${formatNumber(distribution.p90)} ou moins, au plus ${formatNumber(distribution.max)}`
  )
  return {
    content: content.join('') + ticks.join(''),
    height: axisY + ROW_HEIGHT / 2,
    description: `${chart.title}. ${descriptions.join('. ')}.`,
  }
}

/**
 * @param {string[]} keys sorted
 * @param {(key: string) => number} x
 * @returns {{ key: string, label: string }[]} the labels of the axis, far enough from each other
 */
function axisLabels(keys, x) {
  const candidates = keys.every(isMonth)
    ? keys
        .filter((key, index) => index === 0 || key.endsWith('-01'))
        .map((key, index) => ({
          key,
          label: index === 0 ? formatMonth(key) : key.slice(0, 4),
        }))
    : keys.map((key) => ({ key, label: key }))
  let end = Number.NEGATIVE_INFINITY
  return candidates.filter(({ key, label }) => {
    const start = x(key) - (label.length * CHAR_WIDTH) / 2
    if (start < end + GAP) {
      return false
    }
    end = x(key) + (label.length * CHAR_WIDTH) / 2
    return true
  })
}

/**
 * @param {string|number} key
 * @returns {string} the key, in French when it is a month
 */
const formatKey = (key) => (isMonth(key) ? formatMonth(key) : String(key))

/**
 * LINES: one line per list series, over the keys of their items.
 *
 * @param {Chart} chart
 * @param {object} stats
 * @returns {Drawing}
 */
function lines(chart, stats) {
  const series = chart.series.map((s) => ({
    label: s.label ?? chart.title,
    items: seriesData(s, stats),
  }))
  const keys = [
    ...new Set(
      series.flatMap(({ items }) => items.map(({ key }) => String(key)))
    ),
  ].toSorted()
  if (keys.length === 0) {
    return empty(chart)
  }
  const { content: legendContent, height: legendHeight } = legend(
    series.map(({ label }) => label),
    lineColorOf
  )
  const scale = niceCeil(
    Math.max(...series.flatMap(({ items }) => items.map(({ value }) => value)))
  )
  const top = legendHeight + GAP
  const plotWidth = WIDTH - AXIS_WIDTH - GAP
  const positions = new Map(
    keys.map((key, index) => [
      key,
      AXIS_WIDTH +
        (keys.length > 1 ? (index / (keys.length - 1)) * plotWidth : 0),
    ])
  )
  const x = (key) => positions.get(String(key))
  const y = (value) => top + LINES_HEIGHT - (value / scale) * LINES_HEIGHT
  const grid = ticksOf(scale).map(
    (tick) =>
      `<rect x="${AXIS_WIDTH}" y="${round(y(tick))}" width="${plotWidth}" height="1" style="fill: currentColor" fill-opacity="0.15"/>` +
      text(AXIS_WIDTH - GAP, y(tick), formatNumber(tick), 'end')
  )
  const labels = axisLabels(keys, x).map(({ key, label }) =>
    text(x(key), top + LINES_HEIGHT + ROW_HEIGHT / 2 + GAP / 2, label, 'middle')
  )
  const polylines = series.map(({ label, items }, index) => {
    const points = items
      .map(({ key, value }) => `${round(x(key))},${round(y(value))}`)
      .join(' ')
    return `<polyline points="${points}" fill="none" stroke-width="3" stroke-linejoin="round" style="stroke: ${lineColorOf(index)}"><title>${escapeXml(label)}</title></polyline>`
  })
  const descriptions = series.map(({ label, items }) => {
    if (items.length === 0) {
      return `${label} : aucune donnée`
    }
    const first = items[0]
    const last = items.at(-1)
    return `${label} : de ${formatNumber(first.value)} en ${formatKey(first.key)} à ${formatNumber(last.value)} en ${formatKey(last.key)}`
  })
  return {
    content:
      legendContent + grid.join('') + labels.join('') + polylines.join(''),
    height: top + LINES_HEIGHT + ROW_HEIGHT + GAP / 2,
    description: `${chart.title}. ${descriptions.join(' ; ')}.`,
  }
}

/** @type {Record<import('./charts.js').ChartType, (chart: Chart, stats: object) => Drawing>} */
const GENERATORS = {
  COLUMNS: columns,
  PERCENT_BARS: percentBars,
  SHARES: shares,
  STACKED_COLUMNS: stackedColumns,
  DISTRIBUTION: distributions,
  LINES: lines,
}

/**
 * @param {Chart} chart
 * @param {object} stats
 * @returns {string} the `<symbol>` of the chart
 */
function chartSymbol(chart, stats) {
  const { content, height, description } = GENERATORS[chart.type](chart, stats)
  return symbol(
    { id: chart.id, title: chart.title, description, height },
    content
  )
}

/**
 * @param {object} stats the instance usage stats
 * @param {Chart[]} charts as read by `readCharts`
 * @returns {string} the SVG document holding a `<symbol>` per chart
 */
function renderStatsSprite(stats, charts) {
  const symbols = charts.map((chart) => chartSymbol(chart, stats))
  return `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>\n`
}

module.exports = {
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
}
