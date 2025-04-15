const Model = require('../models/user.js')

describe('getAuthProvidersCount', () => {
  test('returns 0 when value is missing', async () => {
    const user = new Model({})

    expect(user.getAuthProvidersCount()).toBe(0)
  })

  test('returns 1 with one service', async () => {
    const user = new Model({
      authProviders: {
        zotero: {
          id: '1234',
          token: 'abcd',
        },
      },
    })

    expect(user.getAuthProvidersCount()).toBe(1)
  })

  test('returns 2 with one configured service and one unset', async () => {
    const user = new Model({
      authProviders: {
        humanid: null,
        hypothesis: {
          id: 'abdc-efgh',
        },
        zotero: {
          id: '1234',
          token: 'abcd',
        },
      },
    })

    expect(user.getAuthProvidersCount()).toBe(2)
  })
})
