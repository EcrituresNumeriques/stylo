import { Bean } from 'lucide-react'
import React from 'react'
import { describe, expect, test, vi } from 'vitest'

import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Component from './Field.jsx'

describe('Field', () => {
  test('renders with minimal options', () => {
    const { getByRole, queryByRole } = render(<Component />)

    expect(getByRole('textbox')).toHaveAttribute('type', 'text')
    expect(queryByRole('label')).not.toBeInTheDocument()
  })

  test('renders with an accessible label', () => {
    const { getByLabelText } = render(
      <Component type="password" label="Mot de passe" />
    )

    expect(getByLabelText('Mot de passe')).toHaveAttribute('type', 'password')
  })

  test('renders with custom name and id', () => {
    const { getByRole } = render(
      <Component name="aaa" id="bbb" label="Mot de passe" />
    )

    const field = getByRole('textbox')

    expect(field).toHaveAttribute('name', 'aaa')
    expect(field).toHaveAttribute('id', 'bbb')
  })

  test('renders with an icon', () => {
    const { getByRole } = render(<Component icon={<Bean />} label="Haricot" />)

    const field = getByRole('textbox')
    const iconElement = field.nextElementSibling
    expect(field).toBeInTheDocument()
    expect(iconElement).toHaveAttribute('aria-hidden')
  })

  test('emits a change event', async () => {
    const onChangeHandler = vi.fn()

    const { getByRole } = render(
      <Component label="Haricot" onChange={onChangeHandler} />
    )

    const field = getByRole('textbox')

    field.focus()
    await userEvent.keyboard('Rouge')

    expect(onChangeHandler).toHaveBeenCalled(5) /* 'Rouge'.length */
  })

  test('renders with a mandatory accessible description', () => {
    const { getByRole, getByText } = render(
      <Component label="Haricot" mandatory />
    )

    const field = getByRole('textbox')
    const label = getByText('Haricot')

    expect(field).toHaveAttribute('required')
    expect(label).toHaveTextContent('Haricot*')
    expect(label).toHaveAccessibleName('Haricot (mandatory field)')
  })

  test('renders with an autofocus', () => {
    const { getByRole } = render(<Component label="Haricot" autoFocus={true} />)

    expect(getByRole('textbox')).toHaveFocus()
  })

  test('renders with children', () => {
    const { getByText } = render(
      <Component icon={Bean} label="Clé">
        <span>Valeur</span>
      </Component>
    )

    const label = getByText('Clé')
    expect(label).toBeInTheDocument()
    expect(label.nextElementSibling).toHaveTextContent('Valeur')
  })
})
