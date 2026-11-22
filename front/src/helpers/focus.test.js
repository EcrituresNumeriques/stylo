import { afterEach, describe, expect, test } from 'vitest'

import { focusPageStart, isFocusLost, shouldFocusPageStart } from './focus.js'

const LAYOUT = `
  <header><a href="/articles">Articles</a></header>
  <main id="content" tabindex="-1"><a href="/article/1">Article</a></main>
`

afterEach(() => {
  document.body.innerHTML = ''
})

function nextMutation() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

describe('isFocusLost', () => {
  test('is lost when the focused element has been removed', () => {
    document.body.innerHTML = LAYOUT
    const link = document.querySelector('main a')
    link.focus()
    expect(isFocusLost()).toBe(false)

    link.remove()
    expect(isFocusLost()).toBe(true)
  })

  test('is lost when the main container holds it', () => {
    document.body.innerHTML = LAYOUT
    document.getElementById('content').focus()
    expect(isFocusLost()).toBe(true)
  })

  test('is lost when the page heading holds it after a page change', () => {
    document.body.innerHTML =
      '<main id="content" tabindex="-1"><h1>Articles</h1></main>'
    focusPageStart()
    expect(isFocusLost()).toBe(true)
  })
})

describe('shouldFocusPageStart', () => {
  test('moves the focus away from the menu link that was followed', () => {
    document.body.innerHTML = LAYOUT
    document.querySelector('header a').focus()
    expect(shouldFocusPageStart()).toBe(true)
  })

  test('keeps the focus on an element of the page', () => {
    document.body.innerHTML = LAYOUT
    document.querySelector('main a').focus()
    expect(shouldFocusPageStart()).toBe(false)
  })
})

describe('focusPageStart', () => {
  test('focuses the page heading without adding it to the tab sequence', () => {
    document.body.innerHTML =
      '<main id="content" tabindex="-1"><h1>Articles</h1></main>'
    focusPageStart()

    const heading = document.querySelector('h1')
    expect(document.activeElement).toBe(heading)
    expect(heading.getAttribute('tabindex')).toBe('-1')
  })

  test('focuses the heading once it is rendered', async () => {
    document.body.innerHTML = '<main id="content" tabindex="-1"><p></p></main>'
    const main = document.getElementById('content')
    focusPageStart()
    expect(document.activeElement).toBe(main)

    main.insertAdjacentHTML('beforeend', '<h1>Articles</h1>')
    await nextMutation()
    expect(document.activeElement).toBe(document.querySelector('h1'))
  })

  test('does not take the focus back once it has been moved', async () => {
    document.body.innerHTML = LAYOUT
    const main = document.getElementById('content')
    focusPageStart()
    document.querySelector('header a').focus()

    main.insertAdjacentHTML('beforeend', '<h1>Articles</h1>')
    await nextMutation()
    expect(document.activeElement).toBe(document.querySelector('header a'))
  })
})
