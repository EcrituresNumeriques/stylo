const { after, before, describe, test } = require('node:test')
const assert = require('node:assert')
const express = require('express')

const { createStatsSvgHandler } = require('./statsSvg.js')

const COMPUTED_AT = new Date('2026-11-25T12:00:00Z')
const CHARTS = [
  {
    id: 'years',
    type: 'COLUMNS',
    title: 'Années',
    series: [
      { path: ['years'], list: true, key: 'year', value: 'n', fields: [] },
    ],
  },
]

describe('GET /stats.svg', () => {
  let server
  let baseUrl
  let getStats
  let now

  before(async () => {
    const app = express()
    app.get(
      '/stats.svg',
      createStatsSvgHandler({
        getStats: (time) => getStats(time),
        cacheDuration: 60_000,
        charts: CHARTS,
        now: () => now,
      })
    )
    server = app.listen(0)
    await new Promise((resolve, reject) =>
      server.once('listening', resolve).once('error', reject)
    )
    baseUrl = `http://127.0.0.1:${server.address().port}`
  })

  after(() => server.close())

  test('serves the sprite of the stats, cached until they are computed again', async () => {
    now = COMPUTED_AT.getTime() + 15_500
    let requestedAt
    getStats = async (time) => {
      requestedAt = time
      return { computedAt: COMPUTED_AT, years: [{ year: 2026, n: 3 }] }
    }
    const response = await fetch(`${baseUrl}/stats.svg`)
    assert.equal(response.status, 200)
    assert.equal(
      response.headers.get('content-type'),
      'image/svg+xml; charset=utf-8'
    )
    assert.equal(response.headers.get('cache-control'), 'public, max-age=44')
    assert.equal(requestedAt, now)
    assert.match(
      await response.text(),
      /<symbol id="years" [^>]*><title>Années/
    )
  })

  test('is not cached when the stats are older than their cache', async () => {
    now = COMPUTED_AT.getTime() + 120_000
    getStats = async () => ({ computedAt: COMPUTED_AT, years: [] })
    const response = await fetch(`${baseUrl}/stats.svg`)
    assert.equal(response.headers.get('cache-control'), 'public, max-age=0')
  })

  test('fails with a 500 when the stats cannot be computed', async () => {
    getStats = async () => {
      throw new Error('MongoDB is down')
    }
    const response = await fetch(`${baseUrl}/stats.svg`)
    assert.equal(response.status, 500)
  })
})
