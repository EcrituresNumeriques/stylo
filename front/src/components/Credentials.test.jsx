import { describe, expect, test } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { renderWithProviders } from '../../tests/setup.js'
import Component from './Credentials.jsx'

describe('Credentials', () => {
  test('renders with OIDC', () => {
    const preloadedState = { activeUser: { authType: 'oidc', authTypes: ['oidc'] } }
    renderWithProviders(<Component />, { preloadedState })

    expect(screen.getByRole('form')).toBeInTheDocument()
    expect(screen.queryByLabelText('credentials.oldPassword.placeholder')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('credentials.newPassword.placeholder')).toBeInTheDocument()
    expect(screen.queryByLabelText('credentials.confirmNewPassword.placeholder')).toBeInTheDocument()
  })

  test('renders with password only', () => {
    const preloadedState = { activeUser: { authType: 'local', authTypes: ['local'] } }
    renderWithProviders(<Component />, { preloadedState })

    expect(screen.getByRole('form')).toBeInTheDocument()
    expect(screen.queryByLabelText('credentials.oldPassword.placeholder')).toBeInTheDocument()
    expect(screen.queryByLabelText('credentials.newPassword.placeholder')).toBeInTheDocument()
    expect(screen.queryByLabelText('credentials.confirmNewPassword.placeholder')).toBeInTheDocument()
  })

  test('renders with both password and oidc', () => {
    const preloadedState = { activeUser: { authType: 'oidc', authTypes: ['oidc', 'local'] } }
    renderWithProviders(<Component />, { preloadedState })

    expect(screen.getByRole('form')).toBeInTheDocument()
    expect(screen.queryByLabelText('credentials.oldPassword.placeholder')).toBeInTheDocument()
    expect(screen.queryByLabelText('credentials.newPassword.placeholder')).toBeInTheDocument()
    expect(screen.queryByLabelText('credentials.confirmNewPassword.placeholder')).toBeInTheDocument()
  })

  test('cannot be submitted when confirmation difers from new password', async () => {
    const preloadedState = { activeUser: { authType: 'local', authTypes: ['local'] } }
    renderWithProviders(<Component />, { preloadedState })

    screen.getByLabelText('credentials.oldPassword.placeholder').focus()
    await userEvent.keyboard('aaaa')

    screen.getByLabelText('credentials.newPassword.placeholder').focus()
    await userEvent.keyboard('abcd')

    screen.getByLabelText('credentials.confirmNewPassword.placeholder').focus()
    await userEvent.keyboard('abc')

    expect(screen.getByRole('button')).toBeDisabled()
  })

  test('can be submitted when confirmation equals new password', async () => {
    const preloadedState = { activeUser: { authType: 'local', authTypes: ['local'] } }
    renderWithProviders(<Component />, { preloadedState })

    screen.getByLabelText('credentials.oldPassword.placeholder').focus()
    await userEvent.keyboard('aaaa')

    screen.getByLabelText('credentials.newPassword.placeholder').focus()
    await userEvent.keyboard('abcd')

    screen.getByLabelText('credentials.confirmNewPassword.placeholder').focus()
    await userEvent.keyboard('abcd')

    expect(screen.getByRole('button')).toBeEnabled()
  })

  test('can be submitted when confirmation equals new password and is oidc', async () => {
    const preloadedState = { activeUser: { authType: 'local', authTypes: ['oidc'] } }
    renderWithProviders(<Component />, { preloadedState })

    screen.getByLabelText('credentials.newPassword.placeholder').focus()
    await userEvent.keyboard('abcd')

    screen.getByLabelText('credentials.confirmNewPassword.placeholder').focus()
    await userEvent.keyboard('abcd')

    expect(screen.getByRole('button')).toBeEnabled()
    fireEvent.click(screen.getByRole('button'))

    expect(fetch).toHaveBeenLastCalledWith(undefined, expect.objectContaining({
      body: expect.stringMatching(/query":"mutation changePassword/)
    }))
  })
})
