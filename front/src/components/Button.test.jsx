import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import Component from './Button.jsx'

describe('Button', () => {
  test('renders as a button (default)', () => {
    render(<Component>Test</Component>)

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  test('renders as a submit button', () => {
    render(<Component primary>Test</Component>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  test('renders with title, className and props', () => {
    render(
      <Component title="ok" disabled small link icon className="truc">
        Test
      </Component>
    )
    expect(screen.getByRole('button')).toHaveAttribute('title', 'ok')
    expect(screen.getByRole('button')).toHaveAttribute('disabled')
    expect(screen.getByRole('button')).toHaveClass(/small/)
    expect(screen.getByRole('button')).toHaveClass(/link/)
    expect(screen.getByRole('button')).toHaveClass(/icon/)
    expect(screen.getByRole('button')).toHaveClass('truc')
  })
})
