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
`, {id: 'abcd1234', replaceBibliography: true})).toBe(`---
authors:
  - forname: Marcello
    orcid: 0000-0001-6424-3229
    surname: Vitali-Rosati
bibliography: abcd1234.bib
subtitle: A user friendly text editor for humanities scholars.
title: Stylo
---`
  )
})

test('year/month/day are derived from date', () => {
  expect(prepare(`---
title: Stylo
date: '2021-02-25'
---
`, {id: 'abcd1234'})).toBe(`---
date: 2021/02/25
day: '25'
month: '02'
title: Stylo
year: '2021'
---`
  )

  expect(prepare(`---
title: Stylo
date: '2021/02/25'
---
`, {id: 'abcd1234'})).toBe(`---
date: 2021/02/25
day: '25'
month: '02'
title: Stylo
year: '2021'
---`
  )
})
