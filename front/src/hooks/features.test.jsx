import { useRouteLoaderData } from 'react-router'
import { describe, expect, test } from 'vitest'

import { renderWithProviders } from '../../tests/setup.js'
import { useFeature } from './features.js'

function Flag() {
  return useFeature('nakala') ? 'enabled' : 'disabled'
}

describe('useFeature', () => {
  test.each([
    [{ features: ['nakala'] }, 'enabled'],
    [{ features: ['webdav'] }, 'disabled'],
    [{}, 'disabled'],
    [null, 'disabled'],
  ])('user %o → %s', (user, expected) => {
    useRouteLoaderData.mockReturnValue({ user })
    const { container } = renderWithProviders(<Flag />)
    expect(container).toHaveTextContent(expected)
  })
})
