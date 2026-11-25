import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouteLoaderData } from 'react-router'
import { describe, expect, test } from 'vitest'

import { renderWithProviders } from '../../../../tests/setup.js'

import Component from './PasswordChange.jsx'

describe('PasswordChange', () => {
  test('renders with OIDC', () => {
    useRouteLoaderData.mockReturnValue({ user: { authTypes: ['oidc'] } })
    renderWithProviders(<Component />)

    expect(screen.getByRole('form')).toBeInTheDocument()
    expect(screen.queryByLabelText('Old password')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('New password')).toBeInTheDocument()
    expect(screen.queryByLabelText('Confirm new password')).toBeInTheDocument()
  })

  test('renders with password only', () => {
    useRouteLoaderData.mockReturnValue({ user: { authTypes: ['local'] } })
    renderWithProviders(<Component />)

    expect(screen.getByRole('form')).toBeInTheDocument()
    expect(screen.queryByLabelText('Old password')).toBeInTheDocument()
    expect(screen.queryByLabelText('New password')).toBeInTheDocument()
    expect(screen.queryByLabelText('Confirm new password')).toBeInTheDocument()
  })

  test('renders with both password and oidc', () => {
    useRouteLoaderData.mockReturnValue({
      user: { authTypes: ['oidc', 'local'] },
    })
    renderWithProviders(<Component />)

    expect(screen.getByRole('form')).toBeInTheDocument()
    expect(screen.queryByLabelText('Old password')).toBeInTheDocument()
    expect(screen.queryByLabelText('New password')).toBeInTheDocument()
    expect(screen.queryByLabelText('Confirm new password')).toBeInTheDocument()
  })

  test('cannot be submitted when confirmation differs from new password', async () => {
    useRouteLoaderData.mockReturnValue({ user: { authTypes: ['local'] } })
    renderWithProviders(<Component />)

    screen.getByLabelText('Old password').focus()
    await userEvent.keyboard('aaaa')

    screen.getByLabelText('New password').focus()
    await userEvent.keyboard('abcd')

    screen.getByLabelText('Confirm new password').focus()
    await userEvent.keyboard('abc')

    expect(screen.getByRole('button')).toBeDisabled()
  })

  test('can be submitted when confirmation equals new password', async () => {
    useRouteLoaderData.mockReturnValue({ user: { authTypes: ['local'] } })
    renderWithProviders(<Component />)

    screen.getByLabelText('Old password').focus()
    await userEvent.keyboard('aaaa')

    screen.getByLabelText('New password').focus()
    await userEvent.keyboard('abcd')

    screen.getByLabelText('Confirm new password').focus()
    await userEvent.keyboard('abcd')

    expect(screen.getByRole('button')).toBeEnabled()
  })

  test('can be submitted when confirmation equals new password and is oidc', async () => {
    useRouteLoaderData.mockReturnValue({ user: { authTypes: ['oidc'] } })
    renderWithProviders(<Component />)

    screen.getByLabelText('New password').focus()
    await userEvent.keyboard('abcd')

    screen.getByLabelText('Confirm new password').focus()
    await userEvent.keyboard('abcd')

    expect(screen.getByRole('button')).toBeEnabled()
    fireEvent.click(screen.getByRole('button'))

    expect(fetch).toHaveBeenLastCalledWith(
      'http://localhost:3000/graphql',
      expect.objectContaining({
        body: expect.stringMatching(/query":"mutation changePassword/),
      })
    )
  })
})
