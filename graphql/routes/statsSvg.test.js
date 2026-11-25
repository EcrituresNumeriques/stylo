const { after, before, describe, test } = require('node:test')
const assert = require('node:assert')
const express = require('express')

const { createStatsSvgHandler, endOfDay } = require('./statsSvg.js')

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

  before(async () => {
    const app = express()
    app.get(
      '/stats.svg',
      createStatsSvgHandler({ getStats: () => getStats(), charts: CHARTS })
    )
    server = app.listen(0)
    await new Promise((resolve, reject) =>
      server.once('listening', resolve).once('error', reject)
    )
    baseUrl = `http://127.0.0.1:${server.address().port}`
  })

  after(() => server.close())

  test('serves the sprite of the stats', async () => {
    getStats = async () => ({ years: [{ year: 2026, n: 3 }] })
    const response = await fetch(`${baseUrl}/stats.svg`)
    assert.equal(response.status, 200)
    assert.equal(
      response.headers.get('content-type'),
      'image/svg+xml; charset=utf-8'
    )
    assert.match(
      await response.text(),
      /<symbol id="years" [^>]*><title>Années/
    )
  })

  test('passes the errors to Express, which answers with a 500', async () => {
    getStats = async () => {
      throw new Error('MongoDB is down')
    }
    const response = await fetch(`${baseUrl}/stats.svg`)
    assert.equal(response.status, 500)
  })
})

describe('endOfDay', () => {
  test('returns the last second of the day, in UTC', () => {
    assert.equal(
      endOfDay(new Date('2026-11-25T22:30:00+01:00')).toISOString(),
      '2026-11-25T23:59:59.000Z'
    )
  })

  test('returns the last second of today by default', () => {
    const today = new Date().toISOString().slice(0, 10)
    assert.equal(endOfDay().toISOString(), `${today}T23:59:59.000Z`)
  })
})
