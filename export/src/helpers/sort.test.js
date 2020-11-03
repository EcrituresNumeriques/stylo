const { byTitle } = require('./sort')

test('sort elements by title (ascending)', () => {
  expect(
    [
      { title: 'nantes' },
      { title: 'strasbourg' },
      { title: 'vernon' },
      { title: 'aix-en-provence' },
      { title: 'lyon' },
      { title: 'paris' },
      { title: 'bordeaux' },
    ].sort(byTitle)
  ).toEqual([
    { title: 'aix-en-provence' },
    { title: 'bordeaux' },
    { title: 'lyon' },
    { title: 'nantes' },
    { title: 'paris' },
    { title: 'strasbourg' },
    { title: 'vernon' },
  ])
})
