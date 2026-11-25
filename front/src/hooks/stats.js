import useSWRImmutable from 'swr/immutable'

export const STATS_SPRITE_URL = '/stats.svg'

/**
 * @typedef {object} StatsChart
 * @property {string} id of its `<symbol>` in the sprite
 * @property {string} viewBox
 * @property {string} title
 * @property {string} description its text alternative
 */

/**
 * @param {string} url of the sprite
 * @returns {Promise<StatsChart[]>} the charts of the sprite
 */
async function fetchCharts(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${url}: ${response.status}`)
  }
  const sprite = new DOMParser().parseFromString(
    await response.text(),
    'image/svg+xml'
  )
  return Array.from(sprite.querySelectorAll('symbol'), (symbol) => ({
    id: symbol.id,
    viewBox: symbol.getAttribute('viewBox'),
    title: symbol.querySelector('title')?.textContent ?? '',
    description: symbol.querySelector('desc')?.textContent ?? '',
  }))
}

/**
 * The charts of the usage stats, read in their SVG sprite:
 * the page needs their size to display them with `<use>`.
 *
 * @returns {import('swr').SWRResponse<StatsChart[]>}
 */
export function useStatsCharts() {
  return useSWRImmutable(STATS_SPRITE_URL, fetchCharts)
}
