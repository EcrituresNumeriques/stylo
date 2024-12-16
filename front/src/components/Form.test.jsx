import { describe, expect, test } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import Component from './Form.jsx'

describe('Form', () => {
  test('renders a form with an empty form data and empty schema/uiSchema', () => {
    const { getByRole } = render(
      <Component formData={{}} schema={{}} uiSchema={{}} />
    )

    expect(getByRole('form')).toBeInTheDocument()
  })
})
