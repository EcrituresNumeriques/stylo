const { reformat, toLegacyFormat, fromLegacyFormat } = require('./metadata')
const YAML = require('js-yaml')
const fs = require('node:fs/promises')
const path = require('node:path')

const inputFilename = path.join(__dirname, '__fixtures__', 'psp1515.input.yml')

test('nocite always appears last', () => {
  expect(
    reformat(
      `---
title: Stylo
nocite: '@*'
subtitle: A user friendly text editor for humanities scholars.
---
`,
      { id: 'abcd1234', replaceBibliography: true }
    )
  ).toMatchInlineSnapshot(`
"---
bibliography: "abcd1234.bib"
subtitle: "A user friendly text editor for humanities scholars."
title: "Stylo"
title_f: "untitled"
nocite: "@*"
---
"
`)
})

test('replace bibliography in YAML metadata', () => {
  expect(
    reformat(
      `---
title: Stylo
bibliography: foo.bib
subtitle: A user friendly text editor for humanities scholars.
authors:
  - forname: Marcello
    surname: Vitali-Rosati
    orcid: 0000-0001-6424-3229
---
`,
      { id: 'abcd1234', replaceBibliography: true }
    )
  ).toMatchInlineSnapshot(`
"---
authors:
- forname: "Marcello"
  orcid: "0000-0001-6424-3229"
  surname: "Vitali-Rosati"
bibliography: "abcd1234.bib"
subtitle: "A user friendly text editor for humanities scholars."
title: "Stylo"
title_f: "untitled"
---
"
`)
})

test('year/month/day are derived from date', () => {
  expect(
    reformat(
      `---
title: Stylo
date: '2021-02-25'
---
`,
      { id: 'abcd1234' }
    )
  ).toMatchInlineSnapshot(`
"---
date: "2021/02/25"
day: "25"
month: "02"
title: "Stylo"
title_f: "untitled"
year: "2021"
---
"
`)

  expect(
    reformat(
      `---
title_f: Stylo
date: '2021/02/25'
---
`,
      { id: 'abcd1234' }
    )
  ).toMatchInlineSnapshot(`
"---
date: "2021/02/25"
day: "25"
month: "02"
title: "Stylo"
title_f: "Stylo"
year: "2021"
---
"
`)
})

test('replace XYZ_f fields by non-formatted XYZ field', () => {
  expect(
    reformat(
      `---
title_f: "**Stylo**"
subtitle_f: "T'as pas _froid_ aux yeux ?"
keywords:
- lang: fr
  list_f:
    - "**Tomme de Savoie**"
    - Comté
    - null
---`,
      { id: 'abcd1234' }
    )
  ).toMatchInlineSnapshot(`
"---
keywords:
- lang: "fr"
  list: "Tomme de Savoie, Comté"
  list_f: "**Tomme de Savoie**, Comté"
subtitle: "T'as pas froid aux yeux ?"
subtitle_f: "T'as pas _froid_ aux yeux ?"
title: "Stylo"
title_f: "**Stylo**"
---
"
`)
})

test('old/string based keywords[x].list_f are unformatted', () => {
  expect(
    reformat(
      `---
title_f: "Stylo"
keywords:
- lang: fr
  list_f: '**Tomme de Savoie**,Comté'
---`,
      { id: 'abcd1234' }
    )
  ).toMatchInlineSnapshot(`
"---
keywords:
- lang: "fr"
  list: "Tomme de Savoie,Comté"
  list_f: "**Tomme de Savoie**,Comté"
title: "Stylo"
title_f: "Stylo"
---
"
`)
})

test('should return empty if YAML is empty', () => {
  expect(reformat('', { id: 'abcd1234' })).toBe('')
})

test('should return empty if YAML is blank', () => {
  expect(reformat(' ', { id: 'abcd1234' })).toBe('')
})

test('should return empty if YAML is undefined', () => {
  expect(reformat(undefined, { id: 'abcd1234' })).toBe('')
})

test('should return empty if YAML is null', () => {
  expect(reformat(null, { id: 'abcd1234' })).toBe('')
})

test('should return empty if YAML is invalid', () => {
  expect(
    reformat(
      `---
\foo:---
- bar:;`,
      { id: 'abcd1234' }
    )
  ).toBe('')
})

test('should be identical', async () => {
  const input = await fs.readFile(inputFilename, 'utf8')

  expect(reformat(input, { id: 'abcd1234' })).toMatchInlineSnapshot(`
"---
abstract:
- lang: "fr"
  text: "Le Groupe d’études sur le néolibéralisme et les alternatives (GENA) a organisé au Conservatoire national des Arts et Métiers (CNAM) un colloque franco-brésilien à Paris le mercredi\\_20\\_mars et le jeudi\\_21\\_mars 2019 intitulé «\\_La crise de la démocratie et le néolibéralisme à la lumière de la situation brésilienne\\_». C’est pour l’essentiel le contenu des contributions à ce colloque que vous allez lire dans ce dossier.\\n"
  text_f: "Le Groupe d’études sur le néolibéralisme et les alternatives (GENA) a organisé au Conservatoire national des Arts et Métiers (CNAM) un colloque franco-brésilien à Paris le mercredi\\_20\\_mars et le jeudi\\_21\\_mars 2019 intitulé «\\_La crise de la démocratie et le néolibéralisme à la lumière de la situation brésilienne\\_». C’est pour l’essentiel le contenu des contributions à ce colloque que vous allez lire dans ce dossier.\\n"
- lang: "en"
  text: "The Study Group on Neoliberalism and Alternatives (GENA) organized at the Conservatoire national des Arts et Métiers (CNAM) a Franco-Brazilian colloquium in Paris on Wednesday, March 20 and Thursday, March 21, 2019 entitled «The crisis of democracy and neoliberalism in light of the Brazilian situation». It is essentially the content of the contributions to this colloquium that this dossier is composed of."
  text_f: "The Study Group on Neoliberalism and Alternatives (GENA) organized at the Conservatoire national des Arts et Métiers (CNAM) a Franco-Brazilian colloquium in Paris on Wednesday, March 20 and Thursday, March 21, 2019 entitled «The crisis of democracy and neoliberalism in light of the Brazilian situation». It is essentially the content of the contributions to this colloquium that this dossier is composed of."
articleslies:
- auteur: ""
  titre: ""
  url: ""
authors:
- forname: "Pierre"
  orcid: "0000-0003-3445-1953"
  surname: "Sauvêtre"
- forname: "Pierre"
  orcid: "0000-0002-0200-8888"
  surname: "Dardot"
- forname: "Christian"
  orcid: "0000-0003-1806-8786"
  surname: "Laval"
controlledKeywords:
- idRameau: "FRBNF119316757"
  label: "Brésil"
  uriRameau: "http://catalogue.bnf.fr/ark:/12148/cb119316758"
- idRameau: "FRBNF119758063"
  label: "Politique et société"
  uriRameau: "http://catalogue.bnf.fr/ark:/12148/cb11975806s"
- idRameau: "FRBNF13318556"
  label: "Démocratie"
  uriRameau: "http://catalogue.bnf.fr/ark:/12148/cb133185567/"
date: "2020/06/25"
day: "25"
diffnum: "Érudit"
director:
- forname: "Gérard"
  gender: "male"
  orcid: "0000-0002-6651-1650"
  surname: "Wormser"
dossier:
- id: "SP1515"
  title: "Le néolibéralisme autoritaire au miroir du Brésil"
  title_f: "Le néolibéralisme autoritaire au miroir du Brésil"
id: "SP1515"
issnnum: "2104-3272"
issueDirectors:
- forname: "Pierre"
  orcid: "0000-0003-3445-1953"
  surname: "Sauvêtre"
- forname: "Pierre"
  orcid: "0000-0002-0200-8888"
  surname: "Dardot"
- forname: "Christian"
  orcid: "0000-0003-1806-8786"
  surname: "Laval"
journal: "Sens public"
keywords:
- lang: "fr"
  list: "Néolibéralisme, Autoritarisme, Brésil, Démocratie"
  list_f: "Néolibéralisme, Autoritarisme, Brésil, Démocratie"
- lang: "en"
  list: "Neoliberalism, Authoritarianism, Brazil, Democracy"
  list_f: "Neoliberalism, Authoritarianism, Brazil, Democracy"
lang: "fr"
link-citations: true
logocredits: "Sauf exception, les photographies accompagnant le dossier sont  de Gérard Wormser, prises en décembre 2019 et février 2020"
month: "06"
prod: "Sens public"
prodnum: "Sens public"
publisher: "Département des littératures de langue française"
rights: "Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)"
title: "Le néolibéralisme autoritaire au miroir du Brésil"
title_f: "Le néolibéralisme autoritaire au miroir du Brésil"
translations:
- lang: ""
  titre: ""
  url: ""
typeArticle:
- "Sommaire dossier"
url_article: "/articles/1515"
year: "2020"
---
"
`)
})

test('should convert to legacy format', async () => {
  const inputFilename = path.join(
    __dirname,
    '__fixtures__',
    'article-uploaded-to-the-cloud-v1.json'
  )

  const input = JSON.parse(await fs.readFile(inputFilename, 'utf8'))
  const actual = toLegacyFormat(input)
  expect(actual).toMatchInlineSnapshot(`
{
  "@version": "1.0",
  "abstract": [
    {
      "lang": "en",
      "text_f": "This article examines how three contemporary television series appropriate the utopian post-humanist visions of life after death in a virtual universe made possible by “mind uploading”, a technology that does not currently exist but is the subject of much discussion and projection.",
    },
    {
      "lang": "fr",
      "text_f": "Cet article se penche sur l’appropriation par trois séries télévisées contemporaines des visions utopiques post-humanistes de la vie après la mort dans un univers virtuel grâce au « téléchargement de conscience », une technologie actuellement inexistante, mais faisant l’objet de nombreuses discussions et projections.",
    },
  ],
  "acknowledgements": "Merci à tous !",
  "articleslies": undefined,
  "authors": [
    {
      "affiliations": "aff",
      "biography": "bio",
      "email": "courriel",
      "foaf": "foaf",
      "forname": "Sylvaine",
      "isni": "isni",
      "orcid": "0000-0001-6424-3229",
      "surname": "Bataille",
      "viaf": "viaf",
      "wikidata": "wikidata",
    },
  ],
  "controlledKeywords": [
    {
      "idRameau": "",
      "label": "F# (langage de programmation)",
      "uriRameau": "http://data.bnf.fr/ark:/12148/cb16191752f",
    },
  ],
  "date": "2024-05-28",
  "diffnum": "Sens Public Web Publishing",
  "director": [
    {
      "forname": "Marcello",
      "surname": "Vitali-Rosati",
    },
  ],
  "dossier": [
    {
      "id": "1710",
      "title_f": "L’œuvre numérique à son miroir : regards sur les créations digitales contemporaines",
    },
  ],
  "funder": {
    "funder_id": "",
    "funder_name": "Université de Montréal",
  },
  "id": "SP1711",
  "issnnum": "2104-3272",
  "issueDirectors": [
    {
      "forname": "Tony",
      "surname": "Gheeraert",
    },
    {
      "forname": "Mélanie",
      "surname": "Lucciano",
    },
    {
      "forname": "Sandra",
      "surname": "Provini",
    },
  ],
  "journal": "Sens Public",
  "journal_email": "redaction@sens-public.org",
  "journal_issue": "2024.8",
  "keywords": [
    {
      "lang": "fr",
      "list_f": [
        "Arts et lettres",
        "Cinéma",
        "Fiction",
      ],
    },
    {
      "lang": "en",
      "list_f": [
        "Cinema",
        "Fiction",
        "Narrative",
      ],
    },
  ],
  "lang": "fr",
  "prod": "Sens Public Prod",
  "prodnum": "Sens Public Web Prod",
  "publisher": "Sens Public Publishing",
  "reviewers": [
    {
      "forname": "McCage",
      "surname": "Griffiths",
    },
  ],
  "rights": "CC BY-SA 4.0",
  "subtitle_f": "Téléchargement de conscience, réflexivité et ré-enchantement de la technologie dans trois fictions sérielles anglophones",
  "title_f": "Uploaded to the cloud… Sounds like heaven!",
  "transcribers": undefined,
  "translatedTitle": [
    {
      "lang": "en",
      "text_f": undefined,
    },
  ],
  "translationOf": [
    undefined,
  ],
  "translations": undefined,
  "translator": [
    {
      "forname": "Shaun",
      "surname": "Nicks",
    },
  ],
  "type": "article",
  "typeArticle": [
    "Essai",
    "Entretien",
    "Chronique",
  ],
  "url_article": "https://sens-public.org/articles/1711/",
}
`)
})

test('should convert from legacy format', async () => {
  const inputFilename = path.join(
    __dirname,
    '__fixtures__',
    'article-uploaded-to-the-cloud-v0.json'
  )

  const input = JSON.parse(await fs.readFile(inputFilename, 'utf8'))
  const actual = fromLegacyFormat(input)
  expect(actual).toMatchInlineSnapshot(`
{
  "@version": "1.0",
  "abstract": "Cet article se penche sur l’appropriation par trois séries télévisées contemporaines des visions utopiques post-humanistes de la vie après la mort dans un univers virtuel grâce au « téléchargement de conscience », une technologie actuellement inexistante, mais faisant l’objet de nombreuses discussions et projections.",
  "acknowledgements": "Merci à tous !",
  "authors": [
    {
      "affiliations": "aff",
      "biography": "bio",
      "email": "courriel",
      "foaf": "foaf",
      "forename": "Sylvaine",
      "isni": "isni",
      "orcid": "0000-0001-6424-3229",
      "surname": "Bataille",
      "viaf": "viaf",
      "wikidata": "wikidata",
    },
  ],
  "controlledKeywords": [
    {
      "idRameau": "",
      "label": "F# (langage de programmation)",
      "uriRameau": "http://data.bnf.fr/ark:/12148/cb16191752f",
    },
  ],
  "funder": {
    "id": "",
    "organization": "Université de Montréal",
  },
  "id": "SP1711",
  "issue": {
    "identifier": "1710",
    "number": "2024.8",
    "title": "L’œuvre numérique à son miroir : regards sur les créations digitales contemporaines",
  },
  "issueDirectors": [
    {
      "forename": "Tony",
      "surname": "Gheeraert",
    },
    {
      "forename": "Mélanie",
      "surname": "Lucciano",
    },
    {
      "forename": "Sandra",
      "surname": "Provini",
    },
  ],
  "journal": {
    "email": "redaction@sens-public.org",
    "name": "Sens Public",
    "publisher": "Sens Public Publishing",
    "url": undefined,
  },
  "journalDirectors": [
    {
      "forename": "Marcello",
      "surname": "Vitali-Rosati",
    },
  ],
  "keywords": [
    "Arts et lettres",
    "Cinéma",
    "Fiction",
  ],
  "lang": "fr",
  "license": "CC BY-SA 4.0",
  "localizedContent": [
    {
      "abstract": "This article examines how three contemporary television series appropriate the utopian post-humanist visions of life after death in a virtual universe made possible by “mind uploading”, a technology that does not currently exist but is the subject of much discussion and projection.",
      "keywords": [
        "Cinema",
        "Fiction",
        "Narrative",
      ],
      "lang": "en",
      "title": undefined,
    },
  ],
  "production": {
    "entities": [
      {
        "media": "",
        "name": "Sens Public Prod",
        "type": "producer",
      },
      {
        "media": "digital",
        "name": "Sens Public Web Prod",
        "type": "producer",
      },
      {
        "media": "digital",
        "name": "Sens Public Web Publishing",
        "type": "publisher",
      },
    ],
    "issn": "2104-3272",
  },
  "publicationDate": "2024-05-28",
  "reviewers": [
    {
      "forename": "McCage",
      "surname": "Griffiths",
    },
  ],
  "senspublic": {
    "categories": [
      "Essai",
      "Entretien",
      "Chronique",
    ],
    "linkedArticles": undefined,
    "translations": undefined,
  },
  "subtitle": "Téléchargement de conscience, réflexivité et ré-enchantement de la technologie dans trois fictions sérielles anglophones",
  "title": "Uploaded to the cloud… Sounds like heaven!",
  "transcribers": undefined,
  "translators": [
    {
      "forename": "Shaun",
      "surname": "Nicks",
    },
  ],
  "type": "article",
  "url": "https://sens-public.org/articles/1711/",
}
`)
})

test('should not throw an exception when converting legacy keywords', async () => {
  const inputFilename = path.join(
    __dirname,
    '__fixtures__',
    'article-keywords-legacy.json'
  )
  const input = JSON.parse(await fs.readFile(inputFilename, 'utf8'))

  const legacyMetadata = toLegacyFormat(input)
  const yaml = YAML.dump(legacyMetadata)
  reformat(yaml, { replaceBibliography: false })
})
