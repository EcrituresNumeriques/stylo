import React from 'react'
import { useRouteLoaderData } from 'react-router'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  getByLabelText,
  getByRole,
  queryByRole,
  screen,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '../../tests/setup.js'

import Component from './Login.jsx'
import RedirectIfAuth from './auth/RedirectIfAuth.jsx'

describe('Login', () => {
  const preloadedState = {
    activeUser: { _id: 'test-user-id' },
  }

  beforeEach(() => {
    useRouteLoaderData.mockReturnValue({ user: null })
  })

  test('redirects when user is already logged in', async () => {
    const redirectCalled = vi.fn()

    useRouteLoaderData.mockReturnValue({
      user: preloadedState.activeUser,
    })

    renderWithProviders(<RedirectIfAuth />, {
      preloadedState,
      extraRoutes: [
        {
          path: '/articles',
          index: true,
          Component() {
            redirectCalled()

            return <section id="articles">Liste des articles</section>
          },
        },
      ],
    })

    expect(redirectCalled).to.toHaveBeenCalledOnce()
  })

  test('does not save when both fields are missing', async () => {
    const user = userEvent.setup()

    const { debug } = renderWithProviders(<Component />)

    debug()

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

    renderWithProviders(<Component />)

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
      'http://localhost:3000/login/local',
      expect.objectContaining({
        body: JSON.stringify({
          username: 'test@example.com',
          password: 'p4ssw0rd',
        }),
      })
    )
  })
})
