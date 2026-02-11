import React from 'react'
import { describe, expect, test } from 'vitest'

import { render } from '@testing-library/react'

import Component from './SelectCombobox.jsx'

describe('SelectCombobox', () => {
  test('renders with minimal options', () => {
    const { getByRole, queryByRole } = render(<Component items={[]} />)
    const combobox = getByRole('combobox')
    expect(combobox).not.toBeDisabled()
  })

  test('renders when loading', () => {
    const { container, getByRole, queryByRole } = render(
      <Component isLoading={true} items={[]} />
    )
    const combobox = getByRole('combobox')
    expect(combobox).toBeDisabled()
    // loading icon
    const icon = container.querySelector('svg')
    expect(icon).toBeVisible()
  })
})
