/**
 * SVG charts of the instance usage stats, served as `<symbol>`s
 * and displayed by the /stats page with `<svg><use href="…#id"/></svg>`.
 *
 * Colors are CSS variables (`--stats-1` to `--stats-4`, then `currentColor`):
 * they are inherited by the content of `<use>`, so the page keeps control of them.
 * Texts are in French.
 */

const WIDTH = 600
const LABEL_WIDTH = 56
const BAR_HEIGHT = 32
const ROW_HEIGHT = 20
const GAP = 8
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

/**
 * @param {number} index of the series, from 0
 * @returns {string} the fill of the series
 */
const fillOf = (index) => `var(--stats-${index + 1}, currentColor)`

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
  const total = parts.reduce((sum, { value }) => sum + value, 0)
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
    const rect = `<rect x="${round(start)}" y="${y}" width="${round(segmentWidth)}" height="${height}" style="fill: ${fillOf(index)}"><title>${escapeXml(`${label} : ${formatShare(share)}`)}</title></rect>`
    if (share < MIN_LABELLED_SHARE) {
      return rect
    }
    const text = `<text x="${round(start + segmentWidth / 2)}" y="${round(y + height / 2)}" dominant-baseline="central" text-anchor="middle" style="fill: var(--stats-on-fill, #fff)">${formatShare(share)}</text>`
    return rect + text
  })
  return track + segments.join('')
}

const round = (value) => Math.round(value * 10) / 10

/**
 * @param {Part[]} parts
 * @returns {string} the parts and their shares, as a sentence
 */
function describeShares(parts) {
  const total = parts.reduce((sum, { value }) => sum + value, 0)
  if (total === 0) {
    return 'aucune donnée'
  }
  return parts
    .map(
      ({ label, value }) =>
        `${label.toLowerCase()} ${formatShare(value / total)}`
    )
    .join(', ')
}

/**
 * @param {{ id: string, title: string, description: string, height: number }} options
 * @param {string} content SVG elements
 * @returns {string} the `<symbol>`, with its title and its text alternative
 */
function symbol({ id, title, description, height }, content) {
  return `<symbol id="${escapeXml(id)}" viewBox="0 0 ${WIDTH} ${height}"><title>${escapeXml(title)}</title><desc>${escapeXml(description)}</desc>${content}</symbol>`
}

const ENGAGEMENT_LEVELS = [
  ['ongoing', 'Actifs ces 12 derniers mois'],
  ['lapsed', 'Usage arrêté'],
  ['tried', 'Essai la première semaine'],
  ['idle', 'Aucune activité'],
]

/**
 * @typedef {{ idle: number, tried: number, lapsed: number, ongoing: number }} EngagementLevels
 */

/**
 * @param {EngagementLevels} engagement
 * @returns {Part[]} the engagement levels, from the most engaged
 */
const engagementParts = (engagement) =>
  ENGAGEMENT_LEVELS.map(([key, label]) => ({ label, value: engagement[key] }))

/**
 * Accounts by engagement: one bar for the whole instance,
 * then one bar per signup year.
 *
 * @param {EngagementLevels & { years: (EngagementLevels & { year: number })[] }} engagement
 * @returns {string} the `engagement` symbol
 */
function engagementSymbol({ years, ...engagement }) {
  const overall = engagementParts(engagement)
  const cohortsTop = BAR_HEIGHT + GAP * 2
  const rows = years.map(({ year, ...engagement }, index) => {
    const y = cohortsTop + index * (ROW_HEIGHT + GAP)
    const label = `<text x="0" y="${y + ROW_HEIGHT / 2}" dominant-baseline="central" style="fill: currentColor">${year}</text>`
    const bar = shareBar(engagementParts(engagement), {
      x: LABEL_WIDTH,
      y,
      width: WIDTH - LABEL_WIDTH,
      height: ROW_HEIGHT,
    })
    return label + bar
  })
  const cohorts = years.map(
    ({ year, ...engagement }) =>
      `en ${year} : ${describeShares(engagementParts(engagement))}`
  )
  const description = [
    `Comptes selon leur engagement : ${describeShares(overall)}.`,
    ...(cohorts.length > 0
      ? [`Par année d'inscription, ${cohorts.join(' ; ')}.`]
      : []),
  ].join(' ')
  const height =
    years.length > 0
      ? cohortsTop + years.length * (ROW_HEIGHT + GAP) - GAP
      : BAR_HEIGHT
  return symbol(
    {
      id: 'engagement',
      title: 'Comptes selon leur engagement',
      description,
      height,
    },
    shareBar(overall, { x: 0, y: 0, width: WIDTH, height: BAR_HEIGHT }) +
      rows.join('')
  )
}

module.exports = {
  describeShares,
  engagementSymbol,
  escapeXml,
  formatShare,
  shareBar,
  symbol,
}
