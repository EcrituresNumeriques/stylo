import { screen } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { describe, expect, test, vi } from 'vitest'

import { renderWithProviders } from '../../../tests/setup.js'

import Stats from './Stats.jsx'

const SPRITE = `<svg xmlns="http://www.w3.org/2000/svg">
  <symbol id="engagement" viewBox="0 0 600 96"><title>Engagement</title><desc>Actifs 6 %</desc><rect/></symbol>
  <symbol id="sizes" viewBox="0 0 600 164"><title>Tailles</title><desc>Médiane 2</desc></symbol>
  <symbol id="bare" viewBox="0 0 600 20"/>
</svg>`

/**
 * @param {object} response of `fetch`
 */
function renderStats(response) {
  vi.mocked(fetch).mockResolvedValueOnce(response)
  // a cache per test
  return renderWithProviders(
    <SWRConfig value={{ provider: () => new Map() }}>
      <Stats />
    </SWRConfig>
  )
}

describe('Stats', () => {
  test('shows a figure per chart of the sprite, at its size', async () => {
    const { container } = renderStats({
      ok: true,
      text: () => Promise.resolve(SPRITE),
    })

    const chart = await screen.findByRole('img', { name: 'Engagement' })
    expect(fetch).toHaveBeenCalledWith('/stats.svg')
    expect(chart).toHaveAttribute('viewBox', '0 0 600 96')
    expect(chart).toHaveAccessibleDescription('Actifs 6 %')
    expect(chart.querySelector('use')).toHaveAttribute(
      'href',
      '/stats.svg#engagement'
    )
    expect(screen.getByRole('img', { name: 'Tailles' })).toHaveAttribute(
      'viewBox',
      '0 0 600 164'
    )
    // a symbol without title nor description
    expect(
      container.querySelector('use[href="/stats.svg#bare"]').closest('svg')
    ).not.toHaveAccessibleDescription()
    expect(container.querySelectorAll('figure')).toHaveLength(3)
    expect(screen.queryByRole('alert')).toBeNull()
  })

  test('shows an error when the sprite cannot be loaded', async () => {
    const { container } = renderStats({ ok: false, status: 500 })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The statistics are not available at the moment.'
    )
    expect(container.querySelectorAll('figure')).toHaveLength(0)
  })
})
