import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import Component from './Toggle.jsx'

describe('Toggle', () => {
  test('w/ basic label', () => {
    const { getByLabelText } = render(<Component>label</Component>)

    expect(getByLabelText('label')).not.toBeChecked()
  })

  test('w/ basic label, checked', () => {
    const { getByLabelText } = render(<Component checked>label</Component>)

    expect(getByLabelText('label')).toBeChecked()
  })

  test('w/o label w/ disabled', () => {
    const { getByLabelText } = render(<Component disabled>label</Component>)

    expect(getByLabelText('label')).toBeDisabled()
  })

  test('w/ onChange trigger', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    const { getByLabelText } = render(
      <Component onChange={onChange}>label</Component>
    )

    const el = getByLabelText('label')

    expect(onChange).not.toHaveBeenCalled()

    await user.click(el)

    await expect(el).toBeChecked()
    expect(onChange).toHaveBeenCalledOnce()
    await expect(onChange).toHaveBeenLastCalledWith(true)
  })

  test('does not call onChange on mount when checked=false', () => {
    const onChange = vi.fn()

    render(
      <Component checked={false} onChange={onChange}>
        label
      </Component>
    )

    expect(onChange).not.toHaveBeenCalled()
  })

  test('does not call onChange on mount when checked=true', () => {
    const onChange = vi.fn()

    render(
      <Component checked onChange={onChange}>
        label
      </Component>
    )

    expect(onChange).not.toHaveBeenCalled()
  })

  test('w/ a11y labels', async () => {
    const user = userEvent.setup()
    const { getByLabelText } = render(
      <Component labels={{ true: 'Oui', false: 'Non' }} />
    )

    const el = getByLabelText('Non')
    await user.click(el)

    await expect(getByLabelText('Oui')).toBeInTheDocument()
  })

  test('w/o a11y labels', () => {
    const spy = vi.spyOn(console, 'warn')

    const { getByRole } = render(<Component />)

    expect(getByRole('switch')).toBeInTheDocument()
    expect(spy).toHaveBeenCalledOnce()
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
