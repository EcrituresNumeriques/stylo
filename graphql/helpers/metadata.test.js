const { fromLegacyFormat } = require('./metadata')
const fs = require('node:fs/promises')
const path = require('node:path')

const { test } = require('node:test')
const assert = require('node:assert')

test('should convert from legacy format', async () => {
  const inputFilename = path.join(
    __dirname,
    '__fixtures__',
    'article-uploaded-to-the-cloud-v0.json'
  )

  const input = JSON.parse(await fs.readFile(inputFilename, 'utf8'))
  const actual = fromLegacyFormat(input)
  assert.deepEqual(actual, {
    '@version': '1.0',
    abstract:
      'Cet article se penche sur l’appropriation par trois séries télévisées contemporaines des visions utopiques post-humanistes de la vie après la mort dans un univers virtuel grâce au « téléchargement de conscience », une technologie actuellement inexistante, mais faisant l’objet de nombreuses discussions et projections.',
    acknowledgements: 'Merci à tous !',
    authors: [
      {
        affiliations: 'aff',
        biography: 'bio',
        email: 'courriel',
        foaf: 'foaf',
        forename: 'Sylvaine',
        isni: 'isni',
        orcid: '0000-0001-6424-3229',
        surname: 'Bataille',
        viaf: 'viaf',
        wikidata: 'wikidata',
      },
    ],
    controlledKeywords: [
      {
        idRameau: '',
        label: 'F# (langage de programmation)',
        uriRameau: 'http://data.bnf.fr/ark:/12148/cb16191752f',
      },
    ],
    funder: {
      id: '',
      organization: 'Université de Montréal',
    },
    id: 'SP1711',
    issue: {
      identifier: '1710',
      number: '2024.8',
      title:
        'L’œuvre numérique à son miroir : regards sur les créations digitales contemporaines',
    },
    issueDirectors: [
      {
        forename: 'Tony',
        surname: 'Gheeraert',
      },
      {
        forename: 'Mélanie',
        surname: 'Lucciano',
      },
      {
        forename: 'Sandra',
        surname: 'Provini',
      },
    ],
    journal: {
      email: 'redaction@sens-public.org',
      name: 'Sens Public',
      publisher: 'Sens Public Publishing',
      url: undefined,
    },
    journalDirectors: [
      {
        forename: 'Marcello',
        surname: 'Vitali-Rosati',
      },
    ],
    keywords: ['Arts et lettres', 'Cinéma', 'Fiction'],
    lang: 'fr',
    license: 'CC BY-SA 4.0',
    localizedContent: [
      {
        abstract:
          'This article examines how three contemporary television series appropriate the utopian post-humanist visions of life after death in a virtual universe made possible by “mind uploading”, a technology that does not currently exist but is the subject of much discussion and projection.',
        keywords: ['Cinema', 'Fiction', 'Narrative'],
        lang: 'en',
        title: undefined,
      },
    ],
    production: {
      entities: [
        {
          media: '',
          name: 'Sens Public Prod',
          type: 'producer',
        },
        {
          media: 'digital',
          name: 'Sens Public Web Prod',
          type: 'producer',
        },
        {
          media: 'digital',
          name: 'Sens Public Web Publishing',
          type: 'publisher',
        },
      ],
      issn: '2104-3272',
    },
    publicationDate: '2024-05-28',
    reviewers: [
      {
        forename: 'McCage',
        surname: 'Griffiths',
      },
    ],
    senspublic: {
      categories: ['Essai', 'Entretien', 'Chronique'],
      linkedArticles: undefined,
      translations: undefined,
    },
    subtitle:
      'Téléchargement de conscience, réflexivité et ré-enchantement de la technologie dans trois fictions sérielles anglophones',
    title: 'Uploaded to the cloud… Sounds like heaven!',
    transcribers: undefined,
    translators: [
      {
        forename: 'Shaun',
        surname: 'Nicks',
      },
    ],
    type: 'article',
    url: 'https://sens-public.org/articles/1711/',
  })
})
