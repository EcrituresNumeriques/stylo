import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import useComponentVisible from './componentVisible.js'

function Menu() {
  const { ref, isComponentVisible, toggleComponentIsVisible } =
    useComponentVisible()
  return (
    <div ref={ref}>
      <button type="button" onClick={toggleComponentIsVisible}>
        toggle
      </button>
      {isComponentVisible && <p>menu</p>}
    </div>
  )
}

describe('useComponentVisible', () => {
  test('closes when clicking outside', () => {
    render(
      <>
        <Menu />
        <span>outside</span>
      </>
    )
    fireEvent.click(screen.getByText('toggle'))
    expect(screen.queryByText('menu')).not.toBeNull()

    fireEvent.click(screen.getByText('outside'))
    expect(screen.queryByText('menu')).toBeNull()
  })

  test('removes listeners when unmounted while visible', () => {
    const { unmount } = render(<Menu />)
    fireEvent.click(screen.getByText('toggle'))
    expect(screen.queryByText('menu')).not.toBeNull()

    act(() => unmount())

    // a leaked listener would throw: "can't access property contains, ref.current is null"
    expect(() => fireEvent.click(document.body)).not.toThrow()
  })
})
