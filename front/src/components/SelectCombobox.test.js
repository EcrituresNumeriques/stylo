import { groupItems } from "./SelectCombobox.js"

describe('groupItems', () => {
  test('it should return a unique non-labeled group', () => {
    const items = [
      { key: 1, name: 'one'},
      { key: 2, name: 'two'}
    ]

    expect(groupItems(items)).toEqual([
      [undefined, [{ key: 1, name: 'one', index: 0}, { key: 2, name: 'two', index: 1}]]
    ])
  })

  test('it should 3 groups, 2 labeled, 1 non-labeled', () => {
    const items = [
      { key: 1, name: 'one'},
      { key: 'user-1', name: 'user one', section: 'user'},
      { key: 'group-1', name: 'group one', section: 'group'},
      { key: 'group-2', name: 'group two', section: 'group'},
    ]

    expect(groupItems(items)).toEqual([
      [undefined, [{ key: 1, name: 'one', index: 0 }]],
      ['user', [{ key: 'user-1', name: 'user one', index: 1, section: 'user'}]],
      ['group', [{ key: 'group-1', name: 'group one', index: 2, section: 'group'}, { key: 'group-2', name: 'group two', index: 3, section: 'group'}]],
    ])
  })
})
