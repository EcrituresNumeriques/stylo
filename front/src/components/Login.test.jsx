import { describe, expect, test } from 'vitest'
import {
  getByRole,
  getByLabelText,
  queryByRole,
  screen,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { renderWithProviders } from '../../tests/setup.js'

import Component from './Login.jsx'

describe('Login', () => {
  const preloadedState = {
    activeUser: { _id: 'test-user-id' },
  }

  test('does not save when both fields are missing', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Component />, {
      preloadedState,
    })

    const form = screen.getByRole('form')
    expect(form).toBeInTheDocument()

    const submitButton = getByRole(form, 'button')
    const username = getByRole(form, 'textbox', { label: 'Username' })
    const password = getByLabelText(form, 'Password')

    await user.click(submitButton)

    // no field
    expect(username).toBeInvalid()

    // username is set
    username.focus()
    await userEvent.keyboard('test@example.com')
    await user.click(submitButton)

    expect(username).toBeValid()
    expect(password).toBeInvalid()

    // password is set
    userEvent.clear(username)
    password.focus()
    await userEvent.keyboard('p4ssw0rd')
    await user.click(submitButton)

    expect(username).toBeInvalid()
    expect(password).toBeValid()
  })

  test('login/password matches', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Component />, {
      preloadedState,
    })

    const form = screen.getByRole('form')
    const submitButton = getByRole(form, 'button')
    const username = getByRole(form, 'textbox', { label: 'Username' })
    const password = getByLabelText(form, 'Password')

    username.focus()
    await userEvent.keyboard('test@example.com')
    password.focus()
    await userEvent.keyboard('p4ssw0rd')
    await user.click(submitButton)

    // no error displayed
    const alert = queryByRole(form, 'alert')
    expect(alert).not.toBeInTheDocument()

    // expect data to have flown as a request
    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      'undefined/login/local',
      expect.objectContaining({
        body: JSON.stringify({
          username: 'test@example.com',
          password: 'p4ssw0rd',
        }),
      })
    )
  })
})
