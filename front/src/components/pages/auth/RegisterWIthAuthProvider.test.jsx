import { describe, expect, test } from 'vitest'

import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '../../../../tests/setup.js'

import Component from './RegisterWithAuthProvider.jsx'

describe('RegisterWithAuthProvider', () => {
  /* have not yet found a way to check the router location */
  test.todo('redirects if already logged in')

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
