const { graphql } = require('graphql')
const { Types } = require('mongoose')
const { after, before, beforeEach, describe, test } = require('node:test')
const assert = require('node:assert')

const schema = require('../schema.js')
const Article = require('../models/article.js')
const Corpus = require('../models/corpus.js')
const User = require('../models/user.js')
const Workspace = require('../models/workspace.js')
const {
  CACHE_DURATION_IN_MS,
  clearStatsCache,
  getStats,
} = require('./statsResolver.js')
const { setup, teardown } = require('../tests/harness.js')
const instance = require('../tests/fixtures/stats.js')

// the recent dates depend on the day the tests run: their years are left out
const pastYears = (years) => years.filter(({ year }) => year < 2024)

/**
 * Inserts documents as is (bypassing Mongoose timestamps), to control their dates.
 *
 * @param {import('mongoose').Model} model
 * @param {object[]} documents
 */
async function insert(model, documents) {
  await model.collection.insertMany(
    documents.map((document) => ({ _id: new Types.ObjectId(), ...document }))
  )
}

const clear = () =>
  Promise.all(
    [Article, Corpus, User, Workspace].map((model) =>
      model.collection.deleteMany({})
    )
  )

const EMPTY_DISTRIBUTION = { p10: null, median: null, p90: null, max: null }

describe('stats resolver', () => {
  let container
  before(async () => {
    container = await setup()
  })

  after(async () => {
    await teardown(container)
  })

  describe('empty instance', () => {
    before(async () => {
      clearStatsCache()
      await clear()
    })

    test('returns zeros, empty lists and empty distributions', async () => {
      const stats = await getStats()

      assert.ok(stats.computedAt instanceof Date)
      assert.deepEqual(stats.users, {
        total: 0,
        authentication: {
          password: 0,
          humanid: 0,
          zotero: 0,
          hypothesis: 0,
          multiple: 0,
        },
        years: [],
      })
      assert.deepEqual(stats.articles, {
        total: 0,
        shared: 0,
        withBibliography: 0,
        bibliographyEntries: EMPTY_DISTRIBUTION,
        withMetadata: 0,
        collaborators: EMPTY_DISTRIBUTION,
        bibliographiesFromZotero: 0,
        metadataLevels: { none: 0, few: 0, several: 0, many: 0 },
        tags: EMPTY_DISTRIBUTION,
        writingDurations: {
          underAMinute: 0,
          underAnHour: 0,
          underADay: 0,
          underAMonth: 0,
          underAYear: 0,
          moreThanAYear: 0,
        },
      })
      assert.deepEqual(stats.activity, [])
      assert.deepEqual(stats.lastTwelveMonths, {
        activeUsers: 0,
        articlesCreated: 0,
        corporaCreated: 0,
      })
      assert.deepEqual(stats.engagement, {
        idle: 0,
        tried: 0,
        lapsed: 0,
        ongoing: 0,
        years: [],
      })
      assert.deepEqual(stats.corpora, {
        total: 0,
        articles: EMPTY_DISTRIBUTION,
        types: [],
        months: [],
      })
      assert.deepEqual(stats.workspaces, {
        total: 0,
        members: EMPTY_DISTRIBUTION,
        articles: EMPTY_DISTRIBUTION,
        months: [],
      })
    })

    test('resolves through the schema (non-null fields)', async () => {
      const { data, errors } = await graphql({
        schema,
        source: `{
          stats {
            computedAt
            users { total authentication { multiple } years { year } }
            articles { total tags { median } metadataLevels { none } writingDurations { underAMinute } }
            activity { year activeUsers inWorkspace seniority { sameYear } }
            lastTwelveMonths { activeUsers articlesCreated corporaCreated }
            engagement { idle years { year ongoing } }
            corpora { total articles { median } types { type } months { month } }
            workspaces { total members { median } articles { max } months { total } }
          }
        }`,
        contextValue: {},
      })

      assert.equal(errors, undefined)
      assert.equal(data.stats.users.total, 0)
      assert.equal(data.stats.corpora.articles.median, null)
    })
  })

  describe('instance', () => {
    let stats
    before(async () => {
      clearStatsCache()
      await clear()
      await insert(User, instance.users)
      await insert(Article, instance.articles)
      await insert(Corpus, instance.corpora)
      await insert(Workspace, instance.workspaces)
      stats = await getStats()
    })

    test('counts the accounts by authentication method', () => {
      // ada has them all, an empty password does not count (david)
      assert.equal(stats.users.total, 16)
      assert.deepEqual(stats.users.authentication, {
        password: 2,
        humanid: 2,
        zotero: 2,
        hypothesis: 1,
        multiple: 1,
      })
    })

    test('counts the created accounts per year', () => {
      assert.deepEqual(pastYears(stats.users.years), [
        { year: 2015, created: 1 },
        { year: 2019, created: 2 },
        { year: 2020, created: 3 },
        { year: 2021, created: 7 },
        { year: 2022, created: 1 },
      ])
    })

    test('ignores the example articles, modified or not', () => {
      // 11 articles of the accounts (nora's first one included),
      // and the one whose owner no longer exists
      assert.equal(stats.articles.total, 12)
    })

    test('counts the shared articles and their collaborators, the author included', () => {
      assert.equal(stats.articles.shared, 2)
      assert.deepEqual(stats.articles.collaborators, {
        p10: 2,
        median: 2,
        p90: 3,
        max: 3,
      })
    })

    test('counts the bibliographies and their entries, whatever blanks precede the first one', () => {
      assert.equal(stats.articles.withBibliography, 2)
      assert.deepEqual(stats.articles.bibliographyEntries, {
        p10: 1,
        median: 1,
        p90: 2,
        max: 2,
      })
      // a Zotero link without bibliography is not counted
      assert.equal(stats.articles.bibliographiesFromZotero, 1)
    })

    test('counts the filled metadata fields, nested ones included', () => {
      // authors, or keywords as a list or as a string; a title alone is not counted
      assert.equal(stats.articles.withMetadata, 3)
      assert.deepEqual(stats.articles.metadataLevels, {
        none: 9,
        few: 2,
        several: 1,
        many: 0,
      })
    })

    test('counts the tags and the writing durations', () => {
      assert.deepEqual(stats.articles.tags, {
        p10: 1,
        median: 1,
        p90: 3,
        max: 3,
      })
      assert.deepEqual(stats.articles.writingDurations, {
        underAMinute: 5,
        underAnHour: 1,
        underADay: 1,
        underAMonth: 1,
        underAYear: 1,
        moreThanAYear: 3,
      })
    })

    test('counts the active users per year, by seniority and workspace membership', () => {
      // never during the week after the signup (nora), never before the signup
      // (bob in 2019 through sharing, mia in 2019 through « Archives »),
      // except as a contributor of an article created that year (gaelle in 2021);
      // hugo through the « Labo » workspace, not emma through the empty one;
      // not the owner who no longer exists
      assert.deepEqual(pastYears(stats.activity), [
        {
          year: 2019,
          activeUsers: 1,
          inWorkspace: 1,
          seniority: {
            sameYear: 1,
            oneToTwoYears: 0,
            threeToFiveYears: 0,
            moreThanFiveYears: 0,
          },
        },
        {
          year: 2020,
          activeUsers: 2,
          inWorkspace: 0,
          seniority: {
            sameYear: 2,
            oneToTwoYears: 0,
            threeToFiveYears: 0,
            moreThanFiveYears: 0,
          },
        },
        {
          year: 2021,
          activeUsers: 4,
          inWorkspace: 2,
          seniority: {
            sameYear: 2,
            oneToTwoYears: 1,
            threeToFiveYears: 0,
            moreThanFiveYears: 1,
          },
        },
        {
          year: 2022,
          activeUsers: 4,
          inWorkspace: 3,
          seniority: {
            sameYear: 1,
            oneToTwoYears: 1,
            threeToFiveYears: 1,
            moreThanFiveYears: 1,
          },
        },
        {
          year: 2023,
          activeUsers: 2,
          inWorkspace: 2,
          seniority: {
            sameYear: 0,
            oneToTwoYears: 0,
            threeToFiveYears: 2,
            moreThanFiveYears: 0,
          },
        },
      ])
    })

    test('counts the active users, the articles and the corpora of the last 12 months', () => {
      // ada and omar (364 days ago), not paul (367 days ago);
      // not karim, who modified his example article
      assert.deepEqual(stats.lastTwelveMonths, {
        activeUsers: 2,
        articlesCreated: 1,
        corporaCreated: 1,
      })
    })

    test('counts the accounts by engagement, without the deleted and the new ones', () => {
      const { years, ...overall } = stats.engagement
      // idle: emma, whose connection does not count;
      // tried: chloe, david, farid, gaelle, karim, nora;
      // lapsed: bob (from his seventh day), hugo, lea, mia, paul; ongoing: ada, omar
      assert.deepEqual(overall, { idle: 1, tried: 6, lapsed: 5, ongoing: 2 })
      assert.deepEqual(pastYears(years), [
        { year: 2015, idle: 0, tried: 0, lapsed: 1, ongoing: 0 },
        { year: 2019, idle: 0, tried: 0, lapsed: 1, ongoing: 1 },
        { year: 2020, idle: 0, tried: 1, lapsed: 1, ongoing: 1 },
        { year: 2021, idle: 1, tried: 4, lapsed: 1, ongoing: 0 },
        { year: 2022, idle: 0, tried: 0, lapsed: 1, ongoing: 0 },
      ])
    })

    test('counts the corpora by type, their articles, and per month', () => {
      assert.equal(stats.corpora.total, 5)
      assert.deepEqual(stats.corpora.articles, {
        p10: 0,
        median: 0,
        p90: 4,
        max: 4,
      })
      assert.deepEqual(stats.corpora.types, [
        { type: 'journal', count: 2 },
        { type: 'neutral', count: 2 },
        { type: 'book', count: 1 },
      ])
      // months without creation included, up to the recent one
      assert.deepEqual(stats.corpora.months.slice(0, 4), [
        { month: '2024-11', created: 2, total: 2 },
        { month: '2024-12', created: 0, total: 2 },
        { month: '2025-01', created: 0, total: 2 },
        { month: '2025-02', created: 1, total: 3 },
      ])
      assert.equal(stats.corpora.months.at(-1).total, 4)
    })

    test('counts the workspaces, their members and articles, and per month', () => {
      assert.equal(stats.workspaces.total, 4)
      assert.deepEqual(stats.workspaces.members, {
        p10: 0,
        median: 2,
        p90: 2,
        max: 2,
      })
      assert.deepEqual(stats.workspaces.articles, {
        p10: 0,
        median: 0,
        p90: 1,
        max: 1,
      })
      assert.deepEqual(stats.workspaces.months, [
        { month: '2024-01', created: 1, total: 1 },
        { month: '2024-02', created: 2, total: 3 },
      ])
    })
  })

  describe('cache', () => {
    beforeEach(async () => {
      clearStatsCache()
      await clear()
    })

    test('computes the stats once while the cache is valid', async () => {
      const now = Date.now()
      const first = await getStats(now)
      await insert(User, [{}])

      const second = await getStats(now + CACHE_DURATION_IN_MS - 1)

      assert.strictEqual(second, first)
      assert.equal(second.users.total, 0)
    })

    test('computes the stats again once the cache has expired', async () => {
      const now = Date.now()
      await getStats(now)
      await insert(User, [{}])

      const stats = await getStats(now + CACHE_DURATION_IN_MS)

      assert.equal(stats.users.total, 1)
    })

    test('shares the same computation between concurrent calls', async (t) => {
      const aggregate = t.mock.method(User, 'aggregate')

      const [first, second] = await Promise.all([getStats(), getStats()])

      assert.strictEqual(first, second)
      assert.equal(aggregate.mock.callCount(), 1)
    })

    test('does not cache a failed computation', async (t) => {
      const aggregate = t.mock.method(User, 'aggregate', () => ({
        allowDiskUse: () => ({ exec: () => Promise.reject(new Error('down')) }),
      }))

      await assert.rejects(getStats(), /down/)
      aggregate.mock.restore()
      const stats = await getStats()

      assert.equal(stats.users.total, 0)
    })
  })
})
