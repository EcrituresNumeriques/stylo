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

const EMPTY_DISTRIBUTION = {
  mean: null,
  p10: null,
  median: null,
  p90: null,
  max: null,
}

// the breakdowns of the active users are tested on their own
const withoutBreakdowns = (activity) =>
  activity.map(({ seniority, inWorkspace, ...yearly }) => yearly)

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
        withBibliography: 0,
        bibliographyEntries: EMPTY_DISTRIBUTION,
        withMetadata: 0,
        perOwner: EMPTY_DISTRIBUTION,
        metadataFields: EMPTY_DISTRIBUTION,
        collaborators: EMPTY_DISTRIBUTION,
        bibliographiesFromZotero: 0,
        withTags: 0,
        metadataLevels: { none: 0, few: 0, several: 0, many: 0 },
        tags: EMPTY_DISTRIBUTION,
        writingDays: EMPTY_DISTRIBUTION,
        writingDurations: {
          underAMinute: 0,
          underAnHour: 0,
          underADay: 0,
          underAMonth: 0,
          underAYear: 0,
          moreThanAYear: 0,
        },
        workspaceMembers: EMPTY_DISTRIBUTION,
        corpusSize: EMPTY_DISTRIBUTION,
        years: [],
      })
      assert.deepEqual(stats.activity, [])
      assert.deepEqual(stats.lastTwelveMonths, {
        activeUsers: 0,
        previousActiveUsers: 0,
        retained: 0,
        articlesCreated: 0,
        corporaCreated: 0,
      })
      assert.deepEqual(stats.retention, [])
      assert.deepEqual(stats.lifespan, {
        accounts: 0,
        lifespanDays: EMPTY_DISTRIBUTION,
      })
      assert.deepEqual(stats.corpora, {
        total: 0,
        articles: EMPTY_DISTRIBUTION,
        types: [],
        years: [],
        months: [],
      })
      assert.deepEqual(stats.workspaces, {
        total: 0,
        distinctMembers: 0,
        members: EMPTY_DISTRIBUTION,
        articles: EMPTY_DISTRIBUTION,
        years: [],
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
            articles { total years { year } }
            activity { year retainedNextYear }
            lastTwelveMonths { activeUsers }
            retention { year lifespanDays { median } returnedAfter30Days { eligible } }
            lifespan { accounts lifespanDays { median } }
            corpora { total articles { median } types { type } years { year } months { month } }
            workspaces { distinctMembers members { median } years { year } months { total } }
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

    test('counts the articles with a bibliography, with metadata, and the articles per owner', async () => {
      const [writer, other] = await insert(User, [{}, {}])
      const emptyMetadata = {
        title: null,
        authors: null,
        abstract: null,
        keywords: [],
      }
      await insert(Article, [
        {
          owner: writer,
          workingVersion: {
            bib: '@book{a,\n  title={A}\n}\n@article{b,\n  title={B}\n}',
            metadata: { ...emptyMetadata, authors: [{ forename: 'Ada' }] },
          },
        },
        {
          owner: writer,
          // an indented entry, and keywords as a string
          workingVersion: {
            bib: '  @misc{c}',
            metadata: { ...emptyMetadata, keywords: 'stylo' },
          },
        },
        {
          owner: writer,
          // the metadata skeleton alone is not counted
          workingVersion: {
            bib: '',
            metadata: { ...emptyMetadata, title: 'T' },
          },
        },
        // no working version at all
        { owner: other },
      ])

      const { articles } = await getStats()

      assert.equal(articles.withBibliography, 2)
      assert.deepEqual(articles.bibliographyEntries, {
        mean: 1.5,
        p10: 1,
        median: 1,
        p90: 2,
        max: 2,
      })
      assert.equal(articles.withMetadata, 2)
      // one filled field (authors, then keywords) in each article with metadata
      assert.deepEqual(articles.metadataFields, {
        mean: 1,
        p10: 1,
        median: 1,
        p90: 1,
        max: 1,
      })
      assert.deepEqual(articles.perOwner, {
        mean: 2,
        p10: 1,
        median: 1,
        p90: 3,
        max: 3,
      })
    })

    test('measures how widely the articles are shared, in workspaces and in corpora', async () => {
      const [owner, a, b, c] = await insert(User, [{}, {}, {}, {}])
      const [solo, pair, inBoth, inCorpus] = await insert(Article, [
        { owner, contributors: [{ user: a }] },
        { owner, contributors: [{ user: a }, { user: b }] },
        { owner },
        { owner },
      ])
      await insert(Workspace, [
        // the members of all the workspaces of an article add up
        { articles: [inBoth], members: [{ user: a }, { user: b }] },
        { articles: [inBoth, solo], members: [{ user: c }] },
      ])
      await insert(Corpus, [
        // the largest corpus of an article counts
        { name: 'Small', articles: [{ article: inBoth, order: 0 }] },
        {
          name: 'Large',
          articles: [inBoth, inCorpus, pair].map((article, order) => ({
            article,
            order,
          })),
        },
      ])

      const { articles } = await getStats()

      // the author is counted along with the contributors
      assert.deepEqual(articles.collaborators, {
        mean: 2.5,
        p10: 2,
        median: 2,
        p90: 3,
        max: 3,
      })
      assert.deepEqual(articles.workspaceMembers, {
        mean: 2,
        p10: 1,
        median: 1,
        p90: 3,
        max: 3,
      })
      assert.deepEqual(articles.corpusSize, {
        mean: 3,
        p10: 3,
        median: 3,
        p90: 3,
        max: 3,
      })
    })

    test('counts the filled metadata fields, nested ones included', async () => {
      const [owner] = await insert(User, [{}])
      await insert(Article, [
        {
          owner,
          workingVersion: {
            metadata: {
              // set by Stylo: not counted
              type: 'article',
              '@version': '1.0',
              // filled: counted
              authors: [{ forename: 'Ada' }],
              journal: { name: 'Revue', publisher: null },
              localizedContent: [{ lang: 'en', title: 'Title' }],
              // empty skeletons: not counted
              abstract: '',
              issue: { title: null, number: null },
              production: { issn: null, entities: [] },
              funder: [{ organization: null }],
            },
          },
        },
      ])

      const { articles } = await getStats()

      assert.equal(articles.metadataFields.max, 3)
      assert.deepEqual(articles.metadataLevels, {
        none: 0,
        few: 1,
        several: 0,
        many: 0,
      })
    })

    test('counts the bibliographies from Zotero, the tags and the writing durations', async () => {
      const [owner] = await insert(User, [{}])
      const created = new Date('2022-01-01')
      const after = (ms) => new Date(created.getTime() + ms)
      const minute = 60 * 1000
      const day = 24 * 60 * minute
      const bib = '@book{a}'
      const tag = () => new Types.ObjectId()
      const article = (ms, extra = {}) => ({
        owner,
        createdAt: created,
        updatedAt: after(ms),
        ...extra,
      })
      await insert(Article, [
        // a bibliography from Zotero
        article(0, { zoteroLink: 'abc', workingVersion: { bib } }),
        // a Zotero link without bibliography, and a bibliography without Zotero
        article(30 * minute, { zoteroLink: 'abc', tags: [tag()] }),
        article(2 * 60 * minute, {
          workingVersion: { bib },
          tags: [tag(), tag(), tag()],
        }),
        article(2 * day),
        article(60 * day),
        article(400 * day),
      ])

      const { articles } = await getStats()

      assert.equal(articles.bibliographiesFromZotero, 1)
      assert.equal(articles.withTags, 2)
      assert.deepEqual(articles.tags, {
        mean: 2,
        p10: 1,
        median: 1,
        p90: 3,
        max: 3,
      })
      assert.deepEqual(articles.writingDurations, {
        underAMinute: 1,
        underAnHour: 1,
        underADay: 1,
        underAMonth: 1,
        underAYear: 1,
        moreThanAYear: 1,
      })
      // the article never modified is not counted
      assert.equal(articles.writingDays.max, 400)
      assert.equal(articles.writingDays.p10, 0)
    })

    test('ignores the example article created with the account, until it is modified', async () => {
      const signedUpAt = new Date('2021-01-01T10:00:00Z')
      const after = (ms) => new Date(signedUpAt.getTime() + ms)
      const [untouched, modified, writer] = await insert(User, [
        { createdAt: signedUpAt },
        { createdAt: signedUpAt },
        { createdAt: signedUpAt },
      ])
      await insert(Article, [
        // example article, never modified: not counted at all
        { owner: untouched, createdAt: after(200), updatedAt: after(200) },
        // example article, modified a year later: only counted as last updated
        {
          owner: modified,
          createdAt: after(500),
          updatedAt: new Date('2022-03-01'),
        },
        // first article of an account, created 10 seconds after the signup
        { owner: writer, createdAt: after(10_000), updatedAt: after(10_000) },
        // second article of an account, even right after the signup
        { owner: modified, createdAt: after(800), updatedAt: after(800) },
      ])

      const { articles } = await getStats()

      assert.equal(articles.total, 2)
      assert.deepEqual(articles.years, [
        { year: 2021, created: 2, lastUpdated: 2, inWorkspace: 0 },
        { year: 2022, created: 0, lastUpdated: 1, inWorkspace: 0 },
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

      const activity = withoutBreakdowns((await getStats()).activity)

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

      const activity = withoutBreakdowns((await getStats()).activity)

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

      const activity = withoutBreakdowns((await getStats()).activity)

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

      const activity = withoutBreakdowns((await getStats()).activity)

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

      const activity = withoutBreakdowns((await getStats()).activity)

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

      const activity = withoutBreakdowns((await getStats()).activity)

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

    test('counts the active users by years since their signup', async () => {
      const users = await insert(User, [
        { createdAt: new Date('2015-06-01') },
        { createdAt: new Date('2018-06-01') },
        { createdAt: new Date('2021-06-01') },
        { createdAt: new Date('2022-01-01') },
      ])
      await insert(
        Article,
        users.map((owner) => ({
          owner,
          createdAt: new Date('2022-03-01'),
          updatedAt: new Date('2022-03-01'),
        }))
      )

      const { activity } = await getStats()

      assert.deepEqual(activity, [
        {
          year: 2022,
          activeUsers: 4,
          retainedNextYear: 0,
          inWorkspace: 0,
          seniority: {
            sameYear: 1,
            oneToTwoYears: 1,
            threeToFiveYears: 1,
            moreThanFiveYears: 1,
          },
        },
      ])
    })

    test('counts the active users who are members of a workspace, even an empty one', async () => {
      const [member, loner, inactive] = await insert(User, [
        { createdAt: signedUpAt },
        { createdAt: signedUpAt },
        { createdAt: signedUpAt },
      ])
      await insert(
        Article,
        [member, loner].map((owner) => ({
          owner,
          createdAt: new Date('2022-03-01'),
          updatedAt: new Date('2022-03-01'),
        }))
      )
      // a workspace without articles, whose members are not active because of it
      await insert(Workspace, [
        { members: [{ user: member }, { user: inactive }], articles: [] },
      ])

      const { activity } = await getStats()

      assert.equal(activity.length, 1)
      assert.equal(activity[0].activeUsers, 2)
      assert.equal(activity[0].inWorkspace, 1)
    })

    test('counts the active users of the last 12 months and of the 12 months before', async () => {
      const now = new Date()
      const ago = (days) => daysAfter(now, -days)
      const [recent, former, regular] = await insert(User, [
        { createdAt: ago(1000) },
        { createdAt: ago(1000) },
        { createdAt: ago(1000) },
      ])
      const article = (owner, at) => ({ owner, createdAt: at, updatedAt: at })
      await insert(Article, [
        article(recent, ago(30)),
        article(former, ago(500)),
        article(regular, ago(30)),
        article(regular, ago(500)),
        // more than two years ago: not counted
        article(former, ago(900)),
      ])

      const { lastTwelveMonths } = await getStats()

      assert.deepEqual(lastTwelveMonths, {
        activeUsers: 2,
        previousActiveUsers: 2,
        retained: 1,
        articlesCreated: 2,
        corporaCreated: 0,
      })
    })

    test('counts the articles and corpora created over the last 12 months, the example articles excluded', async () => {
      const now = new Date()
      const ago = (days) => daysAfter(now, -days)
      const [author, newcomer] = await insert(User, [
        { createdAt: ago(1000) },
        { createdAt: ago(10) },
      ])
      await insert(Article, [
        { owner: author, createdAt: ago(30), updatedAt: ago(30) },
        // more than 12 months ago: not counted
        { owner: author, createdAt: ago(400), updatedAt: ago(400) },
        // example article, even once modified: not counted
        { owner: newcomer, createdAt: ago(10), updatedAt: ago(5) },
      ])
      await insert(Corpus, [
        { name: 'A', createdAt: ago(30) },
        { name: 'B', createdAt: ago(400) },
        // a corpus without a date is not counted
        { name: 'C' },
      ])

      const { lastTwelveMonths } = await getStats()

      assert.equal(lastTwelveMonths.articlesCreated, 1)
      assert.equal(lastTwelveMonths.corporaCreated, 1)
    })

    test('ignores the users who no longer exist', async () => {
      await insert(Article, [
        {
          owner: new Types.ObjectId(),
          createdAt: new Date('2022-02-01'),
          updatedAt: new Date('2022-02-01'),
        },
      ])

      const activity = withoutBreakdowns((await getStats()).activity)

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

      const { retention, lifespan } = await getStats()

      assert.deepEqual(retention, [
        {
          year: 2020,
          accounts: 3,
          lifespanDays: {
            mean: 266.7,
            p10: 0,
            median: 400,
            p90: 400,
            max: 400,
          },
          oneDayOnly: 1,
          returnedAfter30Days: { eligible: 3, returned: 2 },
          returnedAfter1Year: { eligible: 3, returned: 2 },
        },
      ])
      // the account used during its first day only is not counted
      assert.deepEqual(lifespan, {
        accounts: 2,
        lifespanDays: { mean: 400, p10: 400, median: 400, p90: 400, max: 400 },
      })
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
        max: 4,
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
          articles: { mean: 3, p10: 2, median: 2, p90: 4, max: 4 },
        },
        {
          year: 2025,
          created: 1,
          articles: { mean: 0, p10: 0, median: 0, p90: 0, max: 0 },
        },
      ])
    })

    test('counts the corpora created per month, months without creation included', async () => {
      await insert(Corpus, [
        { name: 'A', createdAt: new Date('2024-11-03') },
        { name: 'B', createdAt: new Date('2024-11-28') },
        { name: 'C', createdAt: new Date('2025-02-10') },
        // a corpus without a date is not counted in the months
        { name: 'D' },
      ])

      const { corpora } = await getStats()

      assert.deepEqual(corpora.months, [
        { month: '2024-11', created: 2, total: 2 },
        { month: '2024-12', created: 0, total: 2 },
        { month: '2025-01', created: 0, total: 2 },
        { month: '2025-02', created: 1, total: 3 },
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
        max: 2,
      })
      assert.deepEqual(workspaces.articles, {
        mean: 0.3,
        p10: 0,
        median: 0,
        p90: 1,
        max: 1,
      })
      assert.deepEqual(workspaces.years, [
        {
          year: 2024,
          created: 2,
          members: { mean: 1.5, p10: 1, median: 1, p90: 2, max: 2 },
          articles: { mean: 0.5, p10: 0, median: 0, p90: 1, max: 1 },
        },
      ])
      assert.deepEqual(workspaces.months, [
        { month: '2024-01', created: 1, total: 1 },
        { month: '2024-02', created: 1, total: 2 },
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
