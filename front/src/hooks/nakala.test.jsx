import { waitFor } from '@testing-library/react'
import { expect, test } from 'vitest'

import { renderWithProviders } from '../../tests/setup.js'
import { setSessionToken } from '../helpers/sessionToken.js'
import { useNakalaSearchCollections } from './nakala.js'

function Collections() {
  useNakalaSearchCollections({ scope: 'owner', humanid: 'thom4' })
  return null
}

test('Nakala requests carry the session token', async () => {
  setSessionToken('jwt')
  renderWithProviders(<Collections />)
  await waitFor(() => expect(fetch).toHaveBeenCalled())
  expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer jwt')
})
