import { describe, expect, test } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { renderWithProviders } from '../../tests/setup.js'
import Component from './Credentials.jsx'

describe('Credentials', () => {
  test('renders with OIDC', () => {
    const preloadedState = {
      activeUser: { authType: 'oidc', authTypes: ['oidc'] },
    }
    renderWithProviders(<Component />, { preloadedState })

    expect(screen.getByRole('form')).toBeInTheDocument()
    expect(screen.queryByLabelText('Old password')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('New password')).toBeInTheDocument()
    expect(screen.queryByLabelText('Confirm new password')).toBeInTheDocument()
  })

  test('renders with password only', () => {
    const preloadedState = {
      activeUser: { authType: 'local', authTypes: ['local'] },
    }
    renderWithProviders(<Component />, { preloadedState })

    expect(screen.getByRole('form')).toBeInTheDocument()
    expect(screen.queryByLabelText('Old password')).toBeInTheDocument()
    expect(screen.queryByLabelText('New password')).toBeInTheDocument()
    expect(screen.queryByLabelText('Confirm new password')).toBeInTheDocument()
  })

  test('renders with both password and oidc', () => {
    const preloadedState = {
      activeUser: { authType: 'oidc', authTypes: ['oidc', 'local'] },
    }
    renderWithProviders(<Component />, { preloadedState })

    expect(screen.getByRole('form')).toBeInTheDocument()
    expect(screen.queryByLabelText('Old password')).toBeInTheDocument()
    expect(screen.queryByLabelText('New password')).toBeInTheDocument()
    expect(screen.queryByLabelText('Confirm new password')).toBeInTheDocument()
  })

  test('cannot be submitted when confirmation difers from new password', async () => {
    const preloadedState = {
      activeUser: { authType: 'local', authTypes: ['local'] },
    }
    renderWithProviders(<Component />, { preloadedState })

    screen.getByLabelText('Old password').focus()
    await userEvent.keyboard('aaaa')

    screen.getByLabelText('New password').focus()
    await userEvent.keyboard('abcd')

    screen.getByLabelText('Confirm new password').focus()
    await userEvent.keyboard('abc')

    expect(screen.getByRole('button')).toBeDisabled()
  })

  test('can be submitted when confirmation equals new password', async () => {
    const preloadedState = {
      activeUser: { authType: 'local', authTypes: ['local'] },
    }
    renderWithProviders(<Component />, { preloadedState })

    screen.getByLabelText('Old password').focus()
    await userEvent.keyboard('aaaa')

    screen.getByLabelText('New password').focus()
    await userEvent.keyboard('abcd')

    screen.getByLabelText('Confirm new password').focus()
    await userEvent.keyboard('abcd')

    expect(screen.getByRole('button')).toBeEnabled()
  })

  test('can be submitted when confirmation equals new password and is oidc', async () => {
    const preloadedState = {
      activeUser: { authType: 'local', authTypes: ['oidc'] },
    }
    renderWithProviders(<Component />, { preloadedState })

    screen.getByLabelText('New password').focus()
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
