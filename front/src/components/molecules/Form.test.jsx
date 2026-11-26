import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import Component from './Form.jsx'

const schema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    subtitle: { type: 'string' },
  },
}

describe('Form', () => {
  test('renders a form with an empty form data and empty schema/uiSchema', () => {
    const { getByRole } = render(
      <Component formData={{}} schema={{}} uiSchema={{}} />
    )

    expect(getByRole('form')).toBeInTheDocument()
  })

  test('renders a custom field referenced by ui:field', () => {
    render(
      <Component
        formData={{}}
        schema={schema}
        uiSchema={{ title: { 'ui:field': 'Custom' } }}
        fields={{ Custom: () => <p>custom field</p> }}
      />
    )

    expect(screen.getByText('custom field')).toBeInTheDocument()
  })

  test('renders a custom field referenced by ui:autocomplete', () => {
    render(
      <Component
        formData={{}}
        schema={schema}
        uiSchema={{ 'ui:autocomplete': 'Search' }}
        fields={{ Search: () => <p>autocomplete field</p> }}
      />
    )

    expect(screen.getByText('autocomplete field')).toBeInTheDocument()
  })

  test('ignores ui:autocomplete when the field is not provided', () => {
    render(
      <Component
        formData={{}}
        schema={schema}
        uiSchema={{ 'ui:autocomplete': 'Search' }}
      />
    )

    expect(screen.getAllByRole('textbox')).toHaveLength(2)
  })

  test('renders a group action that updates the form data', () => {
    const onChange = vi.fn()
    const renderGroupAction = vi.fn((group, { update }) =>
      group.importable ? (
        <button type="button" onClick={() => update({ title: 'Imported' })}>
          import
        </button>
      ) : null
    )
    render(
      <Component
        formData={{}}
        schema={schema}
        uiSchema={{
          'ui:groups': [
            { title: 'Main', fields: ['title'], importable: true },
            { title: 'Other', fields: ['subtitle'] },
          ],
        }}
        onChange={onChange}
        renderGroupAction={renderGroupAction}
      />
    )

    expect(screen.getAllByRole('button', { name: 'import' })).toHaveLength(1)
    expect(renderGroupAction).toHaveBeenCalledWith(
      { title: 'Main', fields: ['title'], importable: true },
      { update: expect.any(Function) }
    )

    fireEvent.click(screen.getByRole('button', { name: 'import' }))

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: 'Imported' })
    )
    expect(screen.getByDisplayValue('Imported')).toBeInTheDocument()
  })
})
