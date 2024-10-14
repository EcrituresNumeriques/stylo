import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
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
})
