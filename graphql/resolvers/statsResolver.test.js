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

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000
const CURRENT_YEAR = new Date().getFullYear()

/**
 * Inserts documents as is (bypassing Mongoose timestamps), to control their dates.
 *
 * @param {import('mongoose').Model} model
 * @param {object[]} documents
 * @returns {Promise<Types.ObjectId[]>} the identifiers of the inserted documents
 */
async function insert(model, documents) {
  const docs = documents.map((document) => ({
    _id: new Types.ObjectId(),
    ...document,
  }))
  await model.collection.insertMany(docs)
  return docs.map(({ _id }) => _id)
}

function daysAfter(date, days) {
  return new Date(date.getTime() + days * ONE_DAY_IN_MS)
}

const EMPTY_DISTRIBUTION = { mean: null, p10: null, median: null, p90: null }

describe('stats resolver', () => {
  let container
  before(async () => {
    container = await setup()
  })

  after(async () => {
    await teardown(container)
  })

  beforeEach(async () => {
    clearStatsCache()
    await Promise.all(
      [Article, Corpus, User, Workspace].map((model) =>
        model.collection.deleteMany({})
      )
    )
  })

  describe('empty instance', () => {
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
        inCorpus: 0,
        inWorkspace: 0,
        years: [],
      })
      assert.deepEqual(stats.activity, [])
      assert.deepEqual(stats.retention, [])
      assert.deepEqual(stats.corpora, {
        total: 0,
        articles: EMPTY_DISTRIBUTION,
        types: [],
        years: [],
      })
      assert.deepEqual(stats.workspaces, {
        total: 0,
        distinctMembers: 0,
        members: EMPTY_DISTRIBUTION,
        articles: EMPTY_DISTRIBUTION,
        years: [],
      })
    })

    test('resolves through the schema (non-null fields)', async () => {
      const { data, errors } = await graphql({
        schema,
        source: `{
          stats {
            computedAt
            users { total authentication { multiple } years { year } }
            articles { total years { year } }
            activity { year retainedNextYear }
            retention { year lifespanDays { median } returnedAfter30Days { eligible } }
            corpora { total articles { median } types { type } years { year } }
            workspaces { distinctMembers members { median } years { year } }
          }
        }`,
        contextValue: {},
      })

      assert.equal(errors, undefined)
      assert.equal(data.stats.users.total, 0)
      assert.equal(data.stats.corpora.articles.median, null)
    })
  })

  describe('users', () => {
    test('counts the accounts by authentication method', async () => {
      await insert(User, [
        { email: 'password@example.com', password: 'secret' },
        { email: 'empty-password@example.com', password: '' },
        {
          email: 'humanid-id@example.com',
          authProviders: { humanid: { id: 'humanid-1' } },
        },
        {
          email: 'humanid-email@example.com',
          authProviders: { humanid: { email: 'humanid-email@example.com' } },
        },
        {
          email: 'zotero@example.com',
          authProviders: { zotero: { id: 'zotero-1' } },
        },
        {
          email: 'all@example.com',
          password: 'secret',
          authProviders: {
            humanid: { id: 'humanid-2' },
            zotero: { id: 'zotero-2' },
            hypothesis: { id: 'hypothesis-1' },
          },
        },
      ])

      const { users } = await getStats()

      assert.equal(users.total, 6)
      assert.deepEqual(users.authentication, {
        password: 2,
        humanid: 3,
        zotero: 2,
        hypothesis: 1,
        multiple: 1,
      })
    })

    test('counts created, deleted and last connected accounts per year', async () => {
      await insert(User, [
        { createdAt: new Date('2020-03-01') },
        {
          createdAt: new Date('2020-06-01'),
          connectedAt: new Date('2025-01-10'),
          deletedAt: new Date('2025-02-01'),
        },
        {
          createdAt: new Date('2025-05-01'),
          connectedAt: new Date('2025-05-02'),
        },
        // an account without any date is not counted in the years
        {},
      ])

      const { users } = await getStats()

      assert.equal(users.total, 4)
      assert.deepEqual(users.years, [
        { year: 2020, created: 2, deleted: 0, lastConnected: 0 },
        { year: 2025, created: 1, deleted: 1, lastConnected: 2 },
      ])
    })
  })

  describe('articles', () => {
    test('counts shared articles, articles in a corpus and in a workspace', async () => {
      const [owner, contributor] = await insert(User, [{}, {}])
      const [, inWorkspace, inCorpus] = await insert(Article, [
        {
          owner,
          contributors: [{ user: contributor }],
          createdAt: new Date('2021-01-01'),
          updatedAt: new Date('2022-01-01'),
        },
        {
          owner,
          contributors: [],
          createdAt: new Date('2021-02-01'),
          updatedAt: new Date('2021-03-01'),
        },
        {
          owner,
          createdAt: new Date('2022-01-01'),
          updatedAt: new Date('2022-02-01'),
        },
        { owner },
      ])
      const deletedArticle = new Types.ObjectId()
      await insert(Workspace, [
        { articles: [inWorkspace, deletedArticle], members: [] },
        { articles: [inWorkspace], members: [] },
      ])
      await insert(Corpus, [
        { name: 'Corpus', articles: [{ article: inCorpus, order: 0 }] },
      ])

      const { articles } = await getStats()

      assert.equal(articles.total, 4)
      assert.equal(articles.shared, 1)
      assert.equal(articles.inWorkspace, 1)
      assert.equal(articles.inCorpus, 1)
      assert.deepEqual(articles.years, [
        { year: 2021, created: 2, lastUpdated: 1, inWorkspace: 1 },
        { year: 2022, created: 1, lastUpdated: 2, inWorkspace: 0 },
      ])
    })
  })

  describe('activity', () => {
    const signedUpAt = new Date('2021-01-01')

    test('ignores the articles created or updated during the week after the signup', async () => {
      const [user] = await insert(User, [{ createdAt: signedUpAt }])
      await insert(Article, [
        {
          owner: user,
          createdAt: signedUpAt,
          updatedAt: daysAfter(signedUpAt, 6),
        },
      ])

      const { activity } = await getStats()

      assert.deepEqual(activity, [])
    })

    test('counts a user who created an article after the first week', async () => {
      const [user] = await insert(User, [{ createdAt: signedUpAt }])
      await insert(Article, [
        {
          owner: user,
          createdAt: daysAfter(signedUpAt, 7),
          updatedAt: daysAfter(signedUpAt, 7),
        },
      ])

      const { activity } = await getStats()

      assert.deepEqual(activity, [
        { year: 2021, activeUsers: 1, retainedNextYear: 0 },
      ])
    })

    test('counts the owner and the contributors of an article updated that year', async () => {
      const [owner, contributor] = await insert(User, [
        { createdAt: signedUpAt },
        { createdAt: signedUpAt },
      ])
      await insert(Article, [
        {
          owner,
          contributors: [{ user: contributor }],
          createdAt: new Date('2020-06-01'),
          updatedAt: new Date('2022-03-01'),
        },
      ])

      const { activity } = await getStats()

      assert.deepEqual(
        activity.find(({ year }) => year === 2022),
        { year: 2022, activeUsers: 2, retainedNextYear: 0 }
      )
    })

    test('counts the contributors of an article created that year, even during their first week', async () => {
      const [owner, contributor] = await insert(User, [
        { createdAt: new Date('2019-01-01') },
        { createdAt: signedUpAt },
      ])
      await insert(Article, [
        {
          owner,
          contributors: [{ user: contributor }],
          createdAt: daysAfter(signedUpAt, 1),
          updatedAt: daysAfter(signedUpAt, 1),
        },
      ])

      const { activity } = await getStats()

      assert.deepEqual(activity, [
        { year: 2021, activeUsers: 2, retainedNextYear: 0 },
      ])
    })

    test('counts the members of a workspace in which an article was created that year', async () => {
      const [owner, member] = await insert(User, [
        { createdAt: new Date('2019-01-01') },
        { createdAt: new Date('2019-01-01') },
      ])
      const [article] = await insert(Article, [
        {
          owner,
          createdAt: new Date('2023-04-01'),
          updatedAt: new Date('2023-04-01'),
        },
      ])
      await insert(Workspace, [
        { articles: [article], members: [{ user: owner }, { user: member }] },
      ])

      const { activity } = await getStats()

      assert.deepEqual(activity, [
        { year: 2023, activeUsers: 2, retainedNextYear: 0 },
      ])
    })

    test('counts the users active the next year, and none for the current year', async () => {
      const [user] = await insert(User, [{ createdAt: signedUpAt }])
      await insert(Article, [
        {
          owner: user,
          createdAt: new Date('2022-02-01'),
          updatedAt: new Date('2022-02-01'),
        },
        {
          owner: user,
          createdAt: new Date('2023-02-01'),
          updatedAt: new Date('2023-02-01'),
        },
        { owner: user, createdAt: new Date(), updatedAt: new Date() },
      ])

      const { activity } = await getStats()

      assert.deepEqual(activity.slice(0, 2), [
        { year: 2022, activeUsers: 1, retainedNextYear: 1 },
        { year: 2023, activeUsers: 1, retainedNextYear: 0 },
      ])
      assert.deepEqual(activity.at(-1), {
        year: CURRENT_YEAR,
        activeUsers: 1,
        retainedNextYear: null,
      })
    })

    test('ignores the users who no longer exist', async () => {
      await insert(Article, [
        {
          owner: new Types.ObjectId(),
          createdAt: new Date('2022-02-01'),
          updatedAt: new Date('2022-02-01'),
        },
      ])

      const { activity } = await getStats()

      assert.deepEqual(activity, [])
    })
  })

  describe('retention', () => {
    test('measures the time between the signup and the last activity of each cohort', async () => {
      const signedUpAt = new Date('2020-01-01')
      const [oneDay, connected, writer] = await insert(User, [
        // default article only, never came back
        { createdAt: signedUpAt },
        // came back 40 days later (last connection)
        { createdAt: signedUpAt, connectedAt: daysAfter(signedUpAt, 40) },
        // last wrote in an article 400 days later
        { createdAt: signedUpAt },
      ])
      await insert(Article, [
        { owner: oneDay, createdAt: signedUpAt, updatedAt: signedUpAt },
        {
          owner: connected,
          contributors: [{ user: writer }],
          createdAt: signedUpAt,
          updatedAt: daysAfter(signedUpAt, 400),
        },
      ])
      // the article of `connected` was last updated 400 days later as well
      // (the writer is not recorded): both accounts are counted after a year

      const { retention } = await getStats()

      assert.deepEqual(retention, [
        {
          year: 2020,
          accounts: 3,
          lifespanDays: { mean: 266.7, p10: 0, median: 400, p90: 400 },
          oneDayOnly: 1,
          returnedAfter30Days: { eligible: 3, returned: 2 },
          returnedAfter1Year: { eligible: 3, returned: 2 },
        },
      ])
    })

    test('only counts the accounts old enough for each delay', async () => {
      await insert(User, [
        { createdAt: new Date(), connectedAt: new Date() },
        {
          createdAt: new Date(Date.now() - 60 * ONE_DAY_IN_MS),
          connectedAt: new Date(),
        },
      ])

      const { retention } = await getStats()
      const cohorts = retention.filter(({ year }) => year >= CURRENT_YEAR - 1)
      const total = (key) =>
        cohorts.reduce(
          (sum, cohort) => ({
            eligible: sum.eligible + cohort[key].eligible,
            returned: sum.returned + cohort[key].returned,
          }),
          { eligible: 0, returned: 0 }
        )

      assert.deepEqual(total('returnedAfter30Days'), {
        eligible: 1,
        returned: 1,
      })
      assert.deepEqual(total('returnedAfter1Year'), {
        eligible: 0,
        returned: 0,
      })
    })

    test('counts a last activity before the signup as the signup', async () => {
      const signedUpAt = new Date('2021-01-01')
      const [user] = await insert(User, [{ createdAt: signedUpAt }])
      await insert(Article, [
        {
          owner: new Types.ObjectId(),
          contributors: [{ user }],
          createdAt: new Date('2020-01-01'),
          updatedAt: new Date('2020-01-01'),
        },
      ])

      const { retention } = await getStats()

      assert.equal(retention[0].lifespanDays.median, 0)
      assert.equal(retention[0].oneDayOnly, 1)
    })
  })

  describe('corpora', () => {
    test('counts the corpora by type and the distribution of their articles', async () => {
      const articles = (count) =>
        Array.from({ length: count }, (_, order) => ({
          article: new Types.ObjectId(),
          order,
        }))
      await insert(Corpus, [
        {
          name: 'A',
          type: 'journal',
          articles: articles(2),
          createdAt: new Date('2024-01-01'),
        },
        {
          name: 'B',
          type: 'journal',
          articles: articles(4),
          createdAt: new Date('2024-06-01'),
        },
        // a corpus without a type is a neutral one
        { name: 'C', articles: [], createdAt: new Date('2025-01-01') },
        // a corpus without a date is not counted in the years
        { name: 'D', type: 'book' },
      ])

      const { corpora } = await getStats()

      assert.equal(corpora.total, 4)
      assert.deepEqual(corpora.articles, {
        mean: 1.5,
        p10: 0,
        median: 0,
        p90: 4,
      })
      assert.deepEqual(corpora.types, [
        { type: 'journal', count: 2 },
        { type: 'book', count: 1 },
        { type: 'neutral', count: 1 },
      ])
      assert.deepEqual(corpora.years, [
        {
          year: 2024,
          created: 2,
          articles: { mean: 3, p10: 2, median: 2, p90: 4 },
        },
        {
          year: 2025,
          created: 1,
          articles: { mean: 0, p10: 0, median: 0, p90: 0 },
        },
      ])
    })
  })

  describe('workspaces', () => {
    test('counts the distinct members and the distributions of members and articles', async () => {
      const [alice, bob] = await insert(User, [{}, {}])
      await insert(Workspace, [
        {
          members: [{ user: alice }, { user: bob }],
          articles: [new Types.ObjectId()],
          createdAt: new Date('2024-01-01'),
        },
        {
          members: [{ user: alice }],
          articles: [],
          createdAt: new Date('2024-02-01'),
        },
        // a workspace without members, articles nor date
        {},
      ])

      const { workspaces } = await getStats()

      assert.equal(workspaces.total, 3)
      assert.equal(workspaces.distinctMembers, 2)
      assert.deepEqual(workspaces.members, {
        mean: 1,
        p10: 0,
        median: 1,
        p90: 2,
      })
      assert.deepEqual(workspaces.articles, {
        mean: 0.3,
        p10: 0,
        median: 0,
        p90: 1,
      })
      assert.deepEqual(workspaces.years, [
        {
          year: 2024,
          created: 2,
          members: { mean: 1.5, p10: 1, median: 1, p90: 2 },
          articles: { mean: 0.5, p10: 0, median: 0, p90: 1 },
        },
      ])
    })
  })

  describe('cache', () => {
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
