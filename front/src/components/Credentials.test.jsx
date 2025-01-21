import { describe, expect, test } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { renderWithProviders } from '../../tests/setup.js'
import { applicationConfig } from '../stores/applicationConfig.jsx'
import { authStore } from '../stores/authStore.jsx'
import Component from './Credentials.jsx'

describe('Credentials', () => {
  test('renders with OIDC', () => {
    authStore.setState({
      activeUser: { authType: 'oidc', authTypes: ['oidc'] },
    })
    renderWithProviders(<Component />, {})

    expect(screen.getByRole('form')).toBeInTheDocument()
    expect(
      screen.queryByLabelText('credentials.oldPassword.placeholder')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText('credentials.newPassword.placeholder')
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText('credentials.confirmNewPassword.placeholder')
    ).toBeInTheDocument()
  })

  test('renders with password only', () => {
    authStore.setState({
      activeUser: { authType: 'local', authTypes: ['local'] },
    })
    renderWithProviders(<Component />, {})

    expect(screen.getByRole('form')).toBeInTheDocument()
    expect(
      screen.queryByLabelText('credentials.oldPassword.placeholder')
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText('credentials.newPassword.placeholder')
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText('credentials.confirmNewPassword.placeholder')
    ).toBeInTheDocument()
  })

  test('renders with both password and oidc', () => {
    authStore.setState({
      activeUser: { authType: 'oidc', authTypes: ['oidc', 'local'] },
    })
    renderWithProviders(<Component />, {})

    expect(screen.getByRole('form')).toBeInTheDocument()
    expect(
      screen.queryByLabelText('credentials.oldPassword.placeholder')
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText('credentials.newPassword.placeholder')
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText('credentials.confirmNewPassword.placeholder')
    ).toBeInTheDocument()
  })

  test('cannot be submitted when confirmation differs from new password', async () => {
    authStore.setState({
      activeUser: { authType: 'local', authTypes: ['local'] },
    })
    renderWithProviders(<Component />, {})

    screen.getByLabelText('credentials.oldPassword.placeholder').focus()
    await userEvent.keyboard('aaaa')

    screen.getByLabelText('credentials.newPassword.placeholder').focus()
    await userEvent.keyboard('abcd')

    screen.getByLabelText('credentials.confirmNewPassword.placeholder').focus()
    await userEvent.keyboard('abc')

    expect(screen.getByRole('button')).toBeDisabled()
  })

  test('can be submitted when confirmation equals new password', async () => {
    authStore.setState({
      activeUser: { authType: 'local', authTypes: ['local'] },
    })
    renderWithProviders(<Component />, {})

    screen.getByLabelText('credentials.oldPassword.placeholder').focus()
    await userEvent.keyboard('aaaa')

    screen.getByLabelText('credentials.newPassword.placeholder').focus()
    await userEvent.keyboard('abcd')

    screen.getByLabelText('credentials.confirmNewPassword.placeholder').focus()
    await userEvent.keyboard('abcd')

    expect(screen.getByRole('button')).toBeEnabled()
  })

  test('can be submitted when confirmation equals new password and is oidc', async () => {
    authStore.setState({
      activeUser: { authType: 'local', authTypes: ['oidc'] },
    })
    renderWithProviders(<Component />, {})

    screen.getByLabelText('credentials.newPassword.placeholder').focus()
    await userEvent.keyboard('abcd')

    screen.getByLabelText('credentials.confirmNewPassword.placeholder').focus()
    await userEvent.keyboard('abcd')

    expect(screen.getByRole('button')).toBeEnabled()
    fireEvent.click(screen.getByRole('button'))

    expect(fetch).toHaveBeenLastCalledWith(
      applicationConfig.graphqlEndpoint,
      expect.objectContaining({
        body: expect.stringMatching(/query":"mutation changePassword/),
      })
    )
  })
})
