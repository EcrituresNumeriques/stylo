const { reformat, toLegacyFormat, fromLegacyFormat } = require('./metadata')
const YAML = require('js-yaml')
const fs = require('node:fs/promises')
const path = require('path')

const expectedContentFilename = path.join(__dirname, '__fixtures__', 'psp1515.expected.yml')
const inputFilename = path.join(__dirname, '__fixtures__', 'psp1515.input.yml')

test('nocite always appears last', () => {
  expect(reformat(`---
title: Stylo
nocite: '@*'
subtitle: A user friendly text editor for humanities scholars.
---
`, {id: 'abcd1234', replaceBibliography: true})).toBe(`---
bibliography: abcd1234.bib
subtitle: A user friendly text editor for humanities scholars.
title: Stylo
title_f: untitled
nocite: '@*'
---`
  )
})

test('replace bibliography in YAML metadata', () => {
  expect(reformat(`---
title: Stylo
bibliography: foo.bib
subtitle: A user friendly text editor for humanities scholars.
authors:
  - forname: Marcello
    surname: Vitali-Rosati
    orcid: 0000-0001-6424-3229
---
`, {id: 'abcd1234', replaceBibliography: true})).toBe(`---
authors:
  - forname: Marcello
    orcid: 0000-0001-6424-3229
    surname: Vitali-Rosati
bibliography: abcd1234.bib
subtitle: A user friendly text editor for humanities scholars.
title: Stylo
title_f: untitled
---`
  )
})

test('year/month/day are derived from date', () => {
  expect(reformat(`---
title: Stylo
date: '2021-02-25'
---
`, {id: 'abcd1234'})).toBe(`---
date: 2021/02/25
day: '25'
month: '02'
title: Stylo
title_f: untitled
year: '2021'
---`
  )

  expect(reformat(`---
title_f: Stylo
date: '2021/02/25'
---
`, {id: 'abcd1234'})).toBe(`---
date: 2021/02/25
day: '25'
month: '02'
title: Stylo
title_f: Stylo
year: '2021'
---`
  )
})

test('replace XYZ_f fields by non-formatted XYZ field', () => {
  expect(reformat(`---
title_f: "**Stylo**"
subtitle_f: "T'as pas _froid_ aux yeux ?"
keywords:
- lang: fr
  list_f:
    - "**Tomme de Savoie**"
    - Comté
    - null
---`, {id: 'abcd1234'})).toBe(`---
keywords:
  - lang: fr
    list: Tomme de Savoie, Comté
    list_f: '**Tomme de Savoie**, Comté'
subtitle: T'as pas froid aux yeux ?
subtitle_f: T'as pas _froid_ aux yeux ?
title: Stylo
title_f: '**Stylo**'
---`)
})

test('old/string based keywords[x].list_f are unformatted', () => {
  expect(reformat(`---
title_f: "Stylo"
keywords:
- lang: fr
  list_f: '**Tomme de Savoie**,Comté'
---`, {id: 'abcd1234'})).toBe(`---
keywords:
  - lang: fr
    list: Tomme de Savoie,Comté
    list_f: '**Tomme de Savoie**,Comté'
title: Stylo
title_f: Stylo
---`)
})

test('should return empty if YAML is empty', () => {
  expect(reformat('', {id: 'abcd1234'})).toBe('')
})


test('should return empty if YAML is blank', () => {
  expect(reformat(' ', {id: 'abcd1234'})).toBe('')
})

test('should return empty if YAML is undefined', () => {
  expect(reformat(undefined, {id: 'abcd1234'})).toBe('')
})

test('should return empty if YAML is null', () => {
  expect(reformat(null, {id: 'abcd1234'})).toBe('')
})

test('should return empty if YAML is invalid', () => {
  expect(reformat(`---
\foo:---
- bar:;`, {id: 'abcd1234'})).toBe('')
})

test('should be identical', async () => {
  const expectedContent = await fs.readFile(expectedContentFilename, 'utf8')
  const input = await fs.readFile(inputFilename, 'utf8')

  const expected = '---\n' + YAML.dump(YAML.load(expectedContent, 'utf8'), { sortKeys: true }) + '---'
  expect(reformat(input, {id: 'abcd1234'})).toBe(expected)
})

test('should convert to legacy format', async () => {
  const expectedContentFilename = path.join(__dirname, '__fixtures__', 'article-uploaded-to-the-cloud-v0.json')
  const inputFilename = path.join(__dirname, '__fixtures__', 'article-uploaded-to-the-cloud-v1.json')

  const expectedContent = JSON.parse(await fs.readFile(expectedContentFilename, 'utf8'))
  const input =JSON.parse( await fs.readFile(inputFilename, 'utf8'))
  const actual = toLegacyFormat(input)
  expect(actual).toMatchObject({
    ...expectedContent,
    abstract: expect.arrayContaining(expectedContent.abstract)
  })
})

test('should convert from legacy format', async () => {
  const expectedContentFilename = path.join(__dirname, '__fixtures__', 'article-uploaded-to-the-cloud-v1.json')
  const inputFilename = path.join(__dirname, '__fixtures__', 'article-uploaded-to-the-cloud-v0.json')

  const expectedContent = JSON.parse(await fs.readFile(expectedContentFilename, 'utf8'))
  const input =JSON.parse( await fs.readFile(inputFilename, 'utf8'))
  const actual = fromLegacyFormat(input)
  expect(actual).toMatchObject({
    ...expectedContent,
    journal: {
      ...expectedContent.journal,
      url: undefined
    }
  })
})
