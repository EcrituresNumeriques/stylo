import { describe, test, expect } from 'vitest'
import { groupItems } from './SelectCombobox.js'

describe('groupItems', () => {
  test('it should return a unique non-labeled group', () => {
    const items = [
      { key: 1, name: 'one', index: 3 },
      { key: 2, name: 'two', index: 4 },
    ]

    expect(groupItems(items)).toEqual([
      [
        undefined,
        [
          { key: 1, name: 'one', index: 3 },
          { key: 2, name: 'two', index: 4 },
        ],
      ],
    ])
  })

  test('it should 3 groups, 2 labeled, 1 non-labeled', () => {
    const items = [
      { key: 1, name: 'one', index: 0 },
      { key: 'user-1', name: 'user one', section: 'user', index: 2 },
      { key: 'group-1', name: 'group one', section: 'group', index: 4 },
      { key: 'group-2', name: 'group two', section: 'group', index: 6 },
    ]

    expect(groupItems(items)).toEqual([
      [undefined, [{ key: 1, name: 'one', index: 0 }]],
      [
        'user',
        [{ key: 'user-1', name: 'user one', index: 2, section: 'user' }],
      ],
      [
        'group',
        [
          { key: 'group-1', name: 'group one', index: 4, section: 'group' },
          { key: 'group-2', name: 'group two', index: 6, section: 'group' },
        ],
      ],
    ])
  })
})
