const { prepare } = require('./metadata')

test('replace bibliography in YAML metadata', () => {
  expect(prepare(`---
title: Stylo
bibliography: foo.bib
subtitle: A user friendly text editor for humanities scholars.
authors:
  - forname: Marcello
    surname: Vitali-Rosati
    orcid: 0000-0001-6424-3229
---
`, 'abcd1234')).toBe(`---
title: Stylo
subtitle: A user friendly text editor for humanities scholars.
authors:
  - forname: Marcello
    surname: Vitali-Rosati
    orcid: 0000-0001-6424-3229
bibliography: abcd1234.bib
---`
  )
})
