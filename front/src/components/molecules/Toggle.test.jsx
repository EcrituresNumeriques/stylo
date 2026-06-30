import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18next from 'i18next'
import { describe, expect, test, vi } from 'vitest'

import Component from './Toggle.jsx'

i18next.init({
  initAsync: false,
  lng: 'en',
  resources: {
    en: {
      translation: {
        test_checked: 'Décoche moi',
        test_unchecked: 'Coche moi',
      },
    },
  },
})

describe('Toggle', () => {
  test('w/ basic label', () => {
    const { getByLabelText } = render(<Component labelKey="label" />)

    expect(getByLabelText('label')).not.toBeChecked()
  })

  test('w/ basic label, checked', () => {
    const { getByLabelText } = render(<Component checked labelKey="label" />)

    expect(getByLabelText('label')).toBeChecked()
  })

  test('w/o label w/ disabled', () => {
    const { getByLabelText } = render(<Component disabled labelKey="label" />)

    expect(getByLabelText('label')).toBeDisabled()
  })

  test('w/ onChange trigger', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    const { getByLabelText } = render(
      <Component onChange={onChange} labelKey="label" />
    )

    const el = getByLabelText('label')

    expect(onChange).not.toHaveBeenCalled()

    await user.click(el)

    expect(el).toBeChecked()
    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenLastCalledWith(true)
  })

  test('does not call onChange on mount when checked=false', () => {
    const onChange = vi.fn()

    render(<Component checked={false} onChange={onChange} labelKey="label" />)

    expect(onChange).not.toHaveBeenCalled()
  })

  test('does not call onChange on mount when checked=true', () => {
    const onChange = vi.fn()

    render(<Component checked onChange={onChange} labelKey="label" />)

    expect(onChange).not.toHaveBeenCalled()
  })

  test('w/o a11y labels', () => {
    const { getByRole } = render(<Component />)

    expect(getByRole('switch')).toBeInTheDocument()
  })

  test('w/o a11y labels', () => {
    const { getByLabelText } = render(<Component labelKey="x.y.z" />)

    expect(getByLabelText('x.y.z')).toBeInTheDocument()
  })

  test('w/ a11y labels', async () => {
    const user = userEvent.setup()

    const { getByLabelText } = render(
      <Component labelKey="test" t={i18next.t} />
    )

    const el = getByLabelText('Coche moi')
    await user.click(el)

    await expect(getByLabelText('Décoche moi')).toBeInTheDocument()
  })

  test('works with tab navigation and Enter or Space key', async () => {
    const user = userEvent.setup()
    const { getByRole } = render(<Component />)

    const el = getByRole('switch')

    await user.click(el)
    expect(el).toBeChecked()

    // with Enter
    await user.keyboard('[Enter]')
    expect(el).not.toBeChecked()

    // with Space
    await user.keyboard('[Space]')
    expect(el).toBeChecked()
  })
})
