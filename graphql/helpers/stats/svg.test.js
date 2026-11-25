const { describe, test } = require('node:test')
const assert = require('node:assert')

const {
  describeShares,
  engagementSymbol,
  escapeXml,
  formatShare,
  shareBar,
  symbol,
} = require('./svg.js')

const BOX = { x: 0, y: 0, width: 100, height: 10 }
const count = (svg, pattern) => (svg.match(pattern) ?? []).length

describe('escapeXml', () => {
  test('escapes the XML special characters', () => {
    assert.equal(
      escapeXml(`<a href="x">l'&</a>`),
      '&lt;a href=&quot;x&quot;&gt;l&apos;&amp;&lt;/a&gt;'
    )
  })

  test('converts numbers', () => {
    assert.equal(escapeXml(2026), '2026')
  })
})

describe('formatShare', () => {
  test('rounds to a whole percentage', () => {
    assert.equal(formatShare(0.456), '46 %')
  })

  test('shows 0 % for a null share', () => {
    assert.equal(formatShare(0), '0 %')
  })

  test('shows < 1 % for a tiny share, rather than 0 %', () => {
    assert.equal(formatShare(0.001), '< 1 %')
  })
})

describe('shareBar', () => {
  test('draws an empty track when the total is 0', () => {
    const svg = shareBar([{ label: 'A', value: 0 }], BOX)
    assert.equal(count(svg, /<rect /g), 1)
    assert.match(svg, /fill="none"/)
  })

  test('draws an empty track when there are no parts', () => {
    assert.equal(count(shareBar([], BOX), /<rect /g), 1)
  })

  test('splits the bar proportionally, with a title and a color per part', () => {
    const svg = shareBar(
      [
        { label: 'A', value: 3 },
        { label: 'B', value: 1 },
      ],
      BOX
    )
    assert.match(
      svg,
      /<rect x="0" y="0" width="75" height="10" style="fill: var\(--stats-1, currentColor\)"><title>A : 75 %<\/title>/
    )
    assert.match(
      svg,
      /<rect x="75" y="0" width="25" height="10" style="fill: var\(--stats-2, currentColor\)"><title>B : 25 %<\/title>/
    )
  })

  test('skips the parts without value, keeping the colors of the others', () => {
    const svg = shareBar(
      [
        { label: 'A', value: 0 },
        { label: 'B', value: 1 },
      ],
      BOX
    )
    assert.doesNotMatch(svg, /A :/)
    assert.match(svg, /--stats-2/)
  })

  test('writes the percentage only in the segments wide enough', () => {
    const svg = shareBar(
      [
        { label: 'A', value: 95 },
        { label: 'B', value: 5 },
      ],
      BOX
    )
    assert.equal(count(svg, /<text /g), 1)
    assert.match(svg, /<text [^>]*>95 %<\/text>/)
  })
})

describe('describeShares', () => {
  test('lists the parts with their shares', () => {
    assert.equal(
      describeShares([
        { label: 'Aucune activité', value: 1 },
        { label: 'Usage arrêté', value: 3 },
      ]),
      'aucune activité 25 %, usage arrêté 75 %'
    )
  })

  test('says when there is no data', () => {
    assert.equal(describeShares([{ label: 'A', value: 0 }]), 'aucune donnée')
  })
})

describe('symbol', () => {
  test('wraps the content with a title and a text alternative', () => {
    assert.equal(
      symbol(
        { id: 'x', title: 'T & co', description: 'D', height: 40 },
        '<g/>'
      ),
      '<symbol id="x" viewBox="0 0 600 40"><title>T &amp; co</title><desc>D</desc><g/></symbol>'
    )
  })
})

describe('engagementSymbol', () => {
  const levels = { idle: 1, tried: 1, lapsed: 1, ongoing: 1 }

  test('draws the instance, then one bar per signup year', () => {
    const svg = engagementSymbol({
      ...levels,
      years: [
        { year: 2025, ...levels },
        { year: 2026, idle: 2, tried: 0, lapsed: 0, ongoing: 2 },
      ],
    })
    assert.match(svg, /^<symbol id="engagement" viewBox="0 0 600 96">/)
    assert.match(svg, /<title>Comptes selon leur engagement<\/title>/)
    assert.match(svg, />2025<\/text>/)
    assert.match(svg, />2026<\/text>/)
    assert.match(
      svg,
      /<desc>Comptes selon leur engagement : actifs ces 12 derniers mois 25 %, usage arrêté 25 %, essai la première semaine 25 %, aucune activité 25 %\. Par année d&apos;inscription, en 2025 : [^;]+ ; en 2026 : actifs ces 12 derniers mois 50 %, usage arrêté 0 %, essai la première semaine 0 %, aucune activité 50 %\.<\/desc>/
    )
  })

  test('draws only the instance when there is no signup year', () => {
    const svg = engagementSymbol({ ...levels, years: [] })
    assert.match(svg, /viewBox="0 0 600 32"/)
    assert.doesNotMatch(svg, /Par année/)
  })

  test('describes an empty instance', () => {
    const svg = engagementSymbol({
      idle: 0,
      tried: 0,
      lapsed: 0,
      ongoing: 0,
      years: [],
    })
    assert.match(
      svg,
      /<desc>Comptes selon leur engagement : aucune donnée\.<\/desc>/
    )
  })
})
