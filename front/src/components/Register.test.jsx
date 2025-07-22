import React from 'react'
import { describe, expect, test, vi } from 'vitest'

import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '../../tests/setup.js'

import Component from './Register.jsx'

describe('Register', () => {
  const appLoaderState = {
    user: { _id: 'test-user-id' },
  }

  /* have not yet found a way to check the router location */
  test.skip('redirects if already logged in', async () => {
    renderWithProviders(<Component />, {
      appLoaderState,
    })

    expect(window.location.pathname).toBe('/articles')
  })

  test('does not submit until mandatory fields validate', async () => {
    const user = userEvent.setup()
    const { getByLabelText, getByRole } = renderWithProviders(<Component />)

    const form = getByRole('form')
    expect(form).toBeInvalid()

    await user.type(
      getByRole('textbox', {
        name: 'Email (mandatory field)',
      }),
      'test@example.com'
    )

    await user.type(
      getByRole('textbox', {
        name: 'Username (mandatory field)',
      }),
      'testuser'
    )

    await user.type(getByLabelText('Password (mandatory field)'), 'adminadmin')
    await user.type(
      getByLabelText('Confirm password (mandatory field)'),
      'adminadmin'
    )

    expect(form).toBeValid()
    await user.click(getByRole('button', { name: 'Create an account' }))

    expect(fetch).toHaveBeenCalledOnce()
  })
})
