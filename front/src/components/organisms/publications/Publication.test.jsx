import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import Publication from './Publication.jsx'

function parseEntry(authors) {
  const xml = `<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>Un billet</title>
    <link href="https://revue30.org/blog/un-billet/" rel="alternate"/>
    <updated>2026-11-17T16:19:13+00:00</updated>
    ${authors.map((name) => `<author><name>${name}</name></author>`).join('')}
  </entry>
</feed>`
  return new DOMParser().parseFromString(xml, 'text/xml').querySelector('entry')
}

describe('Publication', () => {
  test('renders the author', () => {
    render(<Publication entry={parseEntry(['Victor Chaix'])} />)
    expect(screen.getByText('Victor Chaix')).toBeInTheDocument()
  })

  test('renders all the authors', () => {
    render(
      <Publication entry={parseEntry(['Victor Chaix', 'Alexia Schneider'])} />
    )
    expect(
      screen.getByText('Victor Chaix, Alexia Schneider')
    ).toBeInTheDocument()
  })

  test('renders an entry without author', () => {
    render(<Publication entry={parseEntry([])} />)
    expect(
      screen.getByRole('heading', { name: 'Un billet' })
    ).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })
})
