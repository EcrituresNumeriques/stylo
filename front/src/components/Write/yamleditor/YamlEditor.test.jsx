import { describe, expect, test } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import Component from './ArticleEditorMetadataForm.jsx'

describe('YamlEditor', () => {
  test('renders with an empty Yaml', () => {
    const { getByRole } = render(<Component yaml="" />)

    expect(getByRole('form')).toBeInTheDocument()
  })

  test('renders with a valid Yaml', () => {
    const yaml = `---
title: How to Stylo
keywords: [un, deux]`

    const { getByRole } = render(<Component yaml={yaml} />)
    expect(getByRole('form')).toBeInTheDocument()
  })

  test('renders with an invalid Yaml', () => {
    const { getByRole } = render(<Component yaml="{ERROR}" />)
    expect(getByRole('form')).toBeInTheDocument()
  })
})
