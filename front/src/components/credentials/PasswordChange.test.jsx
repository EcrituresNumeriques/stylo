import React from 'react'
import { describe, expect, test } from 'vitest'

import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '../../../tests/setup.js'

import Component from './PasswordChange.jsx'

describe('PasswordChange', () => {
  test('renders with OIDC', async () => {
    const appLoaderState = {
      user: { authTypes: ['oidc'] },
    }
    renderWithProviders(<Component />, { appLoaderState })

    const form = await waitFor(() => screen.getByRole('form'))
    expect(form).toBeInTheDocument()
    expect(screen.queryByLabelText('Old password')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('New password')).toBeInTheDocument()
    expect(screen.queryByLabelText('Confirm new password')).toBeInTheDocument()
  })

  test('renders with password only', async () => {
    const appLoaderState = {
      user: { authTypes: ['local'] },
    }
    renderWithProviders(<Component />, { appLoaderState })

    const form = await waitFor(() => screen.getByRole('form'))
    expect(form).toBeInTheDocument()
    expect(screen.queryByLabelText('Old password')).toBeInTheDocument()
    expect(screen.queryByLabelText('New password')).toBeInTheDocument()
    expect(screen.queryByLabelText('Confirm new password')).toBeInTheDocument()
  })

  test('renders with both password and oidc', async () => {
    const appLoaderState = {
      user: { authTypes: ['oidc', 'local'] },
    }
    renderWithProviders(<Component />, { appLoaderState })

    const form = await waitFor(() => screen.getByRole('form'))
    expect(form).toBeInTheDocument()
    expect(screen.queryByLabelText('Old password')).toBeInTheDocument()
    expect(screen.queryByLabelText('New password')).toBeInTheDocument()
    expect(screen.queryByLabelText('Confirm new password')).toBeInTheDocument()
  })

  test('cannot be submitted when confirmation difers from new password', async () => {
    const appLoaderState = {
      user: { authTypes: ['local'] },
    }
    renderWithProviders(<Component />, { appLoaderState })

    const oldPasswordField = await waitFor(() =>
      screen.getByLabelText('Old password')
    )

    oldPasswordField.focus()
    await userEvent.keyboard('aaaa')

    screen.getByLabelText('New password').focus()
    await userEvent.keyboard('abcd')

    screen.getByLabelText('Confirm new password').focus()
    await userEvent.keyboard('abc')

    expect(screen.getByRole('button')).toBeDisabled()
  })

  test('can be submitted when confirmation equals new password', async () => {
    const appLoaderState = {
      user: { authTypes: ['local'] },
    }
    renderWithProviders(<Component />, { appLoaderState })

    const oldPasswordField = await waitFor(() =>
      screen.getByLabelText('Old password')
    )
    oldPasswordField.focus()
    await userEvent.keyboard('aaaa')

    screen.getByLabelText('New password').focus()
    await userEvent.keyboard('abcd')

    screen.getByLabelText('Confirm new password').focus()
    await userEvent.keyboard('abcd')

    expect(screen.getByRole('button')).toBeEnabled()
  })

  test('can be submitted when confirmation equals new password and is oidc', async () => {
    const appLoaderState = {
      user: { authTypes: ['oidc'] },
    }
    renderWithProviders(<Component />, { appLoaderState })

    const newPasswordField = await waitFor(() =>
      screen.getByLabelText('New password')
    )
    newPasswordField.focus()
    await userEvent.keyboard('abcd')

    screen.getByLabelText('Confirm new password').focus()
    await userEvent.keyboard('abcd')

    expect(screen.getByRole('button')).toBeEnabled()
    fireEvent.click(screen.getByRole('button'))

    expect(fetch).toHaveBeenLastCalledWith(
      undefined,
      expect.objectContaining({
        body: expect.stringMatching(/query":"mutation changePassword/),
      })
    )
  })
})
