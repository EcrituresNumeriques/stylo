import { describe, expect, test } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import Component from './Form.jsx'

describe('Form', () => {
  test('renders in basic mode with an empty form data', () => {
    const { getByRole } = render(<Component formData={{}} basicMode={true} />)

    expect(getByRole('form')).toBeInTheDocument()
  })
  test('renders in advanced mode with an empty form data', () => {
    const { getByRole } = render(<Component formData={{}} basicMode={false} />)

    expect(getByRole('form')).toBeInTheDocument()
  })
})
