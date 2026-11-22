const { removeAtomSummaries } = require('./feed')

const { describe, test } = require('node:test')
const assert = require('node:assert')

describe('removeAtomSummaries', () => {
  test('removes summaries and keeps the other elements', () => {
    const feed = `<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Blog</title>
  <entry>
    <title>Atelier Stylo</title>
    <link href="https://revue30.org/blog/atelier/" rel="alternate"/>
    <category term="atelierstylo"/>
    <summary type="html">&lt;p&gt;Texte complet
sur plusieurs lignes&lt;/p&gt;</summary>
    <updated>2026-11-17T16:19:13+00:00</updated>
  </entry>
  <entry>
    <title>Stylog</title>
    <summary/>
  </entry>
</feed>`
    assert.equal(
      removeAtomSummaries(feed),
      `<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Blog</title>
  <entry>
    <title>Atelier Stylo</title>
    <link href="https://revue30.org/blog/atelier/" rel="alternate"/>
    <category term="atelierstylo"/>
    <updated>2026-11-17T16:19:13+00:00</updated>
  </entry>
  <entry>
    <title>Stylog</title>
  </entry>
</feed>`
    )
  })

  test('returns the feed unchanged when there is no summary', () => {
    const feed = '<feed><entry><title>Sans résumé</title></entry></feed>'
    assert.equal(removeAtomSummaries(feed), feed)
  })
})
