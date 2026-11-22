import { act, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, test } from 'vitest'

import useFocusZone from './focusZone.js'

function Zone({ name, children }) {
  const ref = useFocusZone()
  return (
    <section
      ref={ref}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: focus zone, Enter gives access to its content
      tabIndex={0}
      aria-label={name}
    >
      {children}
    </section>
  )
}

function LateZone() {
  const [visible, setVisible] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setVisible(true)}>
        show
      </button>
      {visible && (
        <Zone name="late">
          <button type="button">late action</button>
        </Zone>
      )}
    </>
  )
}

function renderZones() {
  return render(
    <>
      <Zone name="first">
        <button type="button">first action</button>
        <a href="/somewhere">first link</a>
        <dialog>
          <button type="button">dialog action</button>
        </dialog>
      </Zone>
      <Zone name="second">
        <button type="button">second action</button>
      </Zone>
    </>
  )
}

describe('useFocusZone', () => {
  test('removes the content from the tab sequence', () => {
    renderZones()
    expect(screen.getByText('first action').getAttribute('tabindex')).toBe('-1')
    expect(screen.getByText('first link').getAttribute('tabindex')).toBe('-1')
    expect(screen.getByText('second action').getAttribute('tabindex')).toBe(
      '-1'
    )
  })

  test('leaves dialogs untouched', () => {
    renderZones()
    expect(screen.getByText('dialog action').hasAttribute('tabindex')).toBe(
      false
    )
  })

  test('enters the zone with Enter and leaves it with Escape', () => {
    renderZones()
    const zone = screen.getByLabelText('first')
    act(() => zone.focus())

    fireEvent.keyDown(zone, { key: 'Enter' })
    const action = screen.getByText('first action')
    expect(document.activeElement).toBe(action)
    expect(action.hasAttribute('tabindex')).toBe(false)
    expect(screen.getByText('first link').hasAttribute('tabindex')).toBe(false)

    fireEvent.keyDown(action, { key: 'Escape' })
    expect(document.activeElement).toBe(zone)
    expect(action.getAttribute('tabindex')).toBe('-1')
  })

  test('locks the zone again when the focus leaves it', () => {
    renderZones()
    const action = screen.getByText('first action')
    act(() => action.focus())
    expect(action.hasAttribute('tabindex')).toBe(false)

    act(() => screen.getByLabelText('second').focus())
    expect(action.getAttribute('tabindex')).toBe('-1')
  })

  test('does not leave the zone when a menu is open', () => {
    render(
      <Zone name="menu">
        <button type="button" aria-expanded="true">
          menu
        </button>
      </Zone>
    )
    const button = screen.getByText('menu')
    act(() => button.focus())
    fireEvent.keyDown(button, { key: 'Escape' })
    expect(document.activeElement).toBe(button)
  })

  test('works with a zone rendered later', async () => {
    render(<LateZone />)
    fireEvent.click(screen.getByText('show'))
    const zone = screen.getByLabelText('late')
    expect(screen.getByText('late action').getAttribute('tabindex')).toBe('-1')

    act(() => zone.focus())
    fireEvent.keyDown(zone, { key: 'Enter' })
    expect(document.activeElement).toBe(screen.getByText('late action'))
  })

  test('locks content added after the first render', async () => {
    const { rerender } = render(<Zone name="dynamic" />)
    rerender(
      <Zone name="dynamic">
        <button type="button">added</button>
      </Zone>
    )
    // MutationObserver callbacks are asynchronous
    await act(() => Promise.resolve())
    expect(screen.getByText('added').getAttribute('tabindex')).toBe('-1')
  })
})
