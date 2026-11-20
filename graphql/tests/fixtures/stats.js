/**
 * A small Stylo instance, inserted once to test the usage stats.
 * Each person illustrates a rule: their row says what they did.
 */
const { Types } = require('mongoose')

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const id = () => new Types.ObjectId()
const later = (date, ms) => new Date(date.getTime() + ms)
const daysAgo = (days) => later(new Date(), -days * DAY)
const date = (value) => (value instanceof Date ? value : new Date(value))

// [name, signup, other fields, what they did]
const PEOPLE = [
  // every authentication method, writes since 2019, member of « Labo », wrote a month ago
  [
    'ada',
    '2019-01-01',
    {
      password: 'secret',
      authProviders: {
        humanid: { id: 'humanid-ada' },
        zotero: { id: 'zotero-ada' },
        hypothesis: { id: 'hypothesis-ada' },
      },
    },
  ],
  // contributor of an article created before his signup, wrote on his seventh day,
  // member of an empty workspace
  ['bob', '2021-01-01', { authProviders: { humanid: { email: 'bob@a.fr' } } }],
  // modified her example article during her first week
  [
    'chloe',
    '2021-01-01',
    { authProviders: { zotero: { id: 'zotero-chloe' } } },
  ],
  // an empty password, deleted his example article
  ['david', '2021-01-01', { password: '' }],
  // did nothing, but came back yesterday
  ['emma', '2021-06-01', { password: 'secret', connectedAt: daysAgo(1) }],
  // created another article during his first week
  ['farid', '2021-01-01'],
  // contributor of an article created during her first week
  ['gaelle', '2021-01-01'],
  // member of « Labo », in which an article was created in 2023
  ['hugo', '2019-01-01'],
  // deleted account
  ['ines', '2021-01-01', { deletedAt: new Date('2022-01-01') }],
  // signed up 3 days ago
  ['jules', daysAgo(3)],
  // signed up 10 days ago, modified his example article 5 days ago
  ['karim', daysAgo(10)],
  // signed up in 2015, wrote in 2022, contributor of an article created in 2021
  ['lea', '2015-06-01'],
  // signed up in 2022, wrote in 2022, member of « Archives », whose article is older
  ['mia', '2022-01-01'],
  // created her first article 10 seconds after her signup: not an example
  ['nora', '2020-06-01'],
  // wrote in 2020, and 364 days ago: still in the last 12 months
  ['omar', '2020-01-01'],
  // wrote in 2020, and 367 days ago: no longer in the last 12 months
  ['paul', '2020-01-01'],
]

const person = Object.fromEntries(PEOPLE.map(([name]) => [name, id()]))
const signup = Object.fromEntries(
  PEOPLE.map(([name, signedUpAt]) => [name, date(signedUpAt)])
)

const users = PEOPLE.map(([name, , fields = {}]) => ({
  _id: person[name],
  createdAt: signup[name],
  ...fields,
}))

// [owner, updated after (ms)]: the example article, created along with the account
// (david has none: he deleted it)
const EXAMPLES = [
  ['ada', 0],
  ['bob', 0],
  ['chloe', 2 * DAY],
  ['emma', 0],
  ['farid', 0],
  ['gaelle', 0],
  ['ines', 0],
  ['jules', 0],
  ['karim', 5 * DAY],
]

const thesis = id()
const labArticle = id()
const tags = (count) => Array.from({ length: count }, id)

// [owner, created, writing duration (ms), other fields]
const ARTICLES = [
  // a bibliography from Zotero (2 entries, after blanks), 5 metadata fields: several
  [
    'ada',
    '2019-03-01',
    3 * 365 * DAY,
    {
      _id: thesis,
      contributors: [{ user: person.bob }],
      zoteroLink: 'abc',
      tags: tags(3),
      workingVersion: {
        bib: '\n@book{a}\n@book{b}',
        metadata: {
          authors: [{ forename: 'Ada' }],
          journal: { name: 'Revue', publisher: null },
          localizedContent: [{ lang: 'en', title: 'Title' }],
          lang: 'en',
          license: 'CC0',
        },
      },
    },
  ],
  // 4 metadata fields: few, as nothing else is counted
  [
    'ada',
    '2021-01-02',
    30 * MINUTE,
    {
      contributors: [{ user: person.gaelle }, { user: person.lea }],
      tags: tags(1),
      workingVersion: {
        bib: '\r\n  @misc{c}',
        metadata: {
          // set by Stylo: not counted
          type: 'article',
          '@version': '1.0',
          title: 'Title',
          // default values of a new article: not counted
          lang: 'fr',
          license:
            'Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)',
          // filled: counted
          authors: [{ forename: 'Ada' }],
          keywords: ['stylo'],
          publisher: 'Éditeur',
          issue: { title: 'Numéro', number: null },
          // empty skeletons: not counted
          abstract: '',
          production: { issn: null, entities: [] },
          funder: [{ organization: null }],
        },
      },
    },
  ],
  // in « Labo »: a Zotero link without bibliography, a title alone (no metadata)
  [
    'ada',
    '2023-04-01',
    2 * HOUR,
    {
      _id: labArticle,
      zoteroLink: 'abc',
      workingVersion: { bib: '', metadata: { title: 'T' } },
    },
  ],
  ['ada', daysAgo(30), 0],
  // keywords as a string: 1 metadata field
  [
    'bob',
    later(signup.bob, 7 * DAY),
    2 * DAY,
    { workingVersion: { metadata: { keywords: 'stylo' } } },
  ],
  ['farid', later(signup.farid, 6 * DAY), 0],
  ['lea', '2022-03-01', 60 * DAY],
  ['mia', '2022-03-01', 0],
  ['nora', later(signup.nora, 10 * 1000), 0],
  ['omar', '2020-03-01', daysAgo(364) - new Date('2020-03-01')],
  ['paul', '2020-03-01', daysAgo(367) - new Date('2020-03-01')],
  // its owner no longer exists
  [null, '2020-05-01', 0],
]

const articles = [
  ...EXAMPLES.map(([owner, ms]) => ({
    owner: person[owner],
    createdAt: later(signup[owner], 200),
    updatedAt: later(signup[owner], 200 + ms),
  })),
  ...ARTICLES.map(([owner, createdAt, ms, fields = {}]) => ({
    owner: person[owner] ?? id(),
    createdAt: date(createdAt),
    updatedAt: later(date(createdAt), ms),
    ...fields,
  })),
]

const references = (count) =>
  Array.from({ length: count }, (_, order) => ({ article: id(), order }))

// [name, type (neutral when missing), articles, created]
const corpora = [
  ['Revue A', 'journal', 2, '2024-11-03'],
  ['Revue B', 'journal', 4, '2024-11-28'],
  ['Notes', undefined, 0, '2025-02-10'],
  ['Livre', 'book', 0, daysAgo(30)],
  ['Brouillon', undefined, 0, undefined],
].map(([name, type, count, createdAt]) => ({
  name,
  ...(type && { type }),
  articles: references(count),
  ...(createdAt && { createdAt: date(createdAt) }),
}))

const workspaces = [
  {
    name: 'Labo',
    members: [{ user: person.ada }, { user: person.hugo }],
    articles: [labArticle],
    createdAt: new Date('2024-01-01'),
  },
  {
    name: 'Atelier vide',
    members: [{ user: person.bob }, { user: person.emma }],
    articles: [],
    createdAt: new Date('2024-02-01'),
  },
  {
    name: 'Archives',
    members: [{ user: person.ada }, { user: person.mia }],
    articles: [thesis],
    createdAt: new Date('2024-02-15'),
  },
  // without members, articles nor date
  {},
]

module.exports = { articles, corpora, users, workspaces }
