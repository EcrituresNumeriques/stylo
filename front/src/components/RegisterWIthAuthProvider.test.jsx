import { describe, expect, test, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { renderWithProviders } from '../../tests/setup.js'

import Component from './RegisterWithAuthProvider.jsx'

describe('RegisterWithAuthProvider', () => {
  const preloadedState = {
    activeUser: { _id: 'test-user-id' },
  }

  /* have not yet found a way to check the router location */
  test.skip('redirects if already logged in', async () => {
    renderWithProviders(<Component />, {
      preloadedState,
    })

    expect(window.location.pathname).toBe('/articles')
  })

  test('does not submit until mandatory fields validate', async () => {
    const user = userEvent.setup()
    const { getByRole } = renderWithProviders(<Component />)

    const form = getByRole('form')
    expect(form).toBeInvalid()

    await user.type(
      getByRole('textbox', {
        name: 'Display name (mandatory field)',
      }),
      'testuser'
    )

    expect(form).toBeValid()

    await user.click(getByRole('button', { name: 'Create an account' }))

    expect(fetch).toHaveBeenCalledOnce()
  })
})
