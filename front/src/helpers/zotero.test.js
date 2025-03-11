import { describe, test, expect, vi, beforeEach } from 'vitest'
import {
  fetchBibliographyFromCollectionHref,
  prefixLegacyUrl,
  toApiUrl,
} from './zotero'

describe('fetchBibliographyFromCollection', () => {
  fetch
    .mockRestore()
    .mockResolvedValueOnce({
      headers: new Headers({
        Link: '<https://api.zotero.org/page/2>; rel="next"',
      }),
      text: vi.fn().mockResolvedValue(`
@book{grossetie_test1_nodate,
	title = {test1},
	publisher = {Moi},
	author = {Grossetie, Guillaume},
}

@misc{grossetie_hello_nodate,
	title = {Hello},
	shorttitle = {Hi},
	author = {Grossetie, Guillaume},
}`),
    })
    .mockResolvedValueOnce({
      headers: new Headers({
        Link: '<https://api.zotero.org/page/3>; rel="next"',
      }),
      text: vi.fn().mockResolvedValue(''),
    })
    .mockResolvedValueOnce({
      headers: new Headers({}),
      text: vi.fn().mockResolvedValue(`
@misc{grossetie_test_nodate,
	type = {yuzutech.fr},
	title = {test},
	journal = {How to},
	author = {GROSSETIE, guillaume},
}`),
    })

  test('fetches a paginated collection of more than 25 elements', async () => {
    const zoteroId = '2478772/collections/UGF4W4PZ'
    const bib = await fetchBibliographyFromCollectionHref({
      collectionHref: `https://api.zotero.org/groups/${zoteroId}`,
    })

    return expect(bib).toMatchFileSnapshot(
      '__snapshots__/zotero/group-collection.bib'
    )
  })
})

describe('toApiUrl', () => {
  const fakeToken = 'ku1mTEyPCxhU7FgbjUkx1WiP'

  beforeEach(async () => {
    fetch.mockRestore().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          userID: 4922242,
          username: 'mattheyje',
        }),
    })
  })

  test('an existing API URL', async () => {
    const url = 'https://api.zotero.org/users/4922242/items'

    await expect(toApiUrl(url)).resolves.toBe(url)
  })

  test('ma library', async () => {
    const url = 'https://www.zotero.org/mattheyje/library'

    await expect(toApiUrl(url, fakeToken)).resolves.toBe(
      'https://api.zotero.org/users/4922242/items'
    )

    await expect(toApiUrl(url)).rejects.toThrow()
  })

  test('ma library, échoue avec un token non-correspondant', async () => {
    const url = 'https://www.zotero.org/mattheyje/library'

    fetch.mockRestore().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          userID: 4922242,
          username: 'thom4',
        }),
    })

    await expect(toApiUrl(url, fakeToken)).rejects.toThrow(
      'Cannot fetch another member personal library'
    )
  })

  test('converts legacy url', () => {
    const url = '[2381910]/revue_f%C3%A9mur/collections/[P3JEQVU4]'

    return expect(toApiUrl(prefixLegacyUrl(url))).resolves.toBe(
      'https://api.zotero.org/groups/2381910/collections/P3JEQVU4/items'
    )
  })

  test('converts library url', async () => {
    const url = 'https://www.zotero.org/mattheyje/collections/DITT533A'

    await expect(toApiUrl(url, fakeToken)).resolves.toBe(
      'https://api.zotero.org/users/4922242/collections/DITT533A/items'
    )

    await expect(toApiUrl(url)).rejects.toThrow()
  })

  test('un item sélectionné dans une collection personnelle', async () => {
    const url =
      'https://www.zotero.org/mattheyje/collections/DITT533A/items/LXVEBKSN/collection'
    await expect(toApiUrl(url, fakeToken)).resolves.toBe(
      'https://api.zotero.org/users/4922242/items/LXVEBKSN'
    )

    await expect(toApiUrl(url)).rejects.toThrow()
  })

  test('groupe', async () => {
    await expect(
      toApiUrl('https://www.zotero.org/groups/3822124/articlesamroute/library')
    ).resolves.toBe('https://api.zotero.org/groups/3822124/items')

    await expect(
      toApiUrl('https://www.zotero.org/groups/1612889/ethnocomptabilites')
    ).resolves.toBe('https://api.zotero.org/groups/1612889/items')

    await expect(
      toApiUrl(
        'https://www.zotero.org/groups/1612889/ethnocomptabilites/library'
      )
    ).resolves.toBe('https://api.zotero.org/groups/1612889/items')
  })

  test('(sous)-collection dans un groupe', async () => {
    await expect(
      toApiUrl(
        'https://www.zotero.org/groups/2373533/article_durassavoie-bernard/collections/FYFFI3VG'
      )
    ).resolves.toBe(
      'https://api.zotero.org/groups/2373533/collections/FYFFI3VG/items'
    )

    await expect(
      toApiUrl(
        'https://www.zotero.org/groups/1612889/ethnocomptabilites/collections/8ZJKU2RM'
      )
    ).resolves.toBe(
      'https://api.zotero.org/groups/1612889/collections/8ZJKU2RM/items'
    )

    await expect(
      toApiUrl(
        'https://www.zotero.org/groups/2381910/revue_fémur/collections/P3JEQVU4'
      )
    ).resolves.toBe(
      'https://api.zotero.org/groups/2381910/collections/P3JEQVU4/items'
    )

    await expect(
      toApiUrl(
        'https://www.zotero.org/groups/2381910/revue_f%C3%A9mur/collections/P3JEQVU4'
      )
    ).resolves.toBe(
      'https://api.zotero.org/groups/2381910/collections/P3JEQVU4/items'
    )

    await expect(
      toApiUrl(
        'https://www.zotero.org/groups/2317031/emattheyfren615/collections/3LDNMKGB'
      )
    ).resolves.toBe(
      'https://api.zotero.org/groups/2317031/collections/3LDNMKGB/items'
    )

    await expect(
      toApiUrl('https://www.zotero.org/groups/2317031/collections/3LDNMKGB')
    ).resolves.toBe(
      'https://api.zotero.org/groups/2317031/collections/3LDNMKGB/items'
    )
  })

  test("item sélectionné dans une collection d'un groupe", async () => {
    await expect(
      toApiUrl(
        'https://www.zotero.org/groups/2373533/article_durassavoie-bernard/collections/FYFFI3VG/items/V4H7CRG5/collection'
      )
    ).resolves.toBe('https://api.zotero.org/groups/2373533/items/V4H7CRG5')

    await expect(
      toApiUrl(
        'https://www.zotero.org/groups/1612889/ethnocomptabilites/collections/6F2QIM32/items/WM2LXQB9/collection'
      )
    ).resolves.toBe('https://api.zotero.org/groups/1612889/items/WM2LXQB9')

    await expect(
      toApiUrl(
        'https://www.zotero.org/groups/2381910/revue_fémur/collections/P3JEQVU4/items/6VR4JGQX/collection'
      )
    ).resolves.toBe('https://api.zotero.org/groups/2381910/items/6VR4JGQX')
  })

  test('items liés à un tag', () => {
    return expect(
      toApiUrl(
        'https://www.zotero.org/groups/5025104/thomas_parisot_-_articles_et_pr%C3%A9sentations/collections/363N88U7/tags/video/collection'
      )
    ).rejects.toThrow('Cannot fetch items associated to a tag.')
  })

  test('throw an error otherwise', async () => {
    await expect(
      toApiUrl(
        'https://www.example.com/groups/2373533/article_durassavoie-bernard/collections/FYFFI3VG/items/V4H7CRG5/collection'
      )
    ).rejects.toThrowError('This is not a Zotero URL')

    await expect(
      toApiUrl(
        'https://www.example.com/groups/2373533/article_durassavoie-bernard/collections/FYFFI3VG/items/V4H7CRG5/collection'
      )
    ).rejects.toThrowError('This is not a Zotero URL')
  })
})

describe('prefixLegacyUrl', () => {
  test('prefix something that looks like a Zotero suffix URL', () => {
    expect(prefixLegacyUrl('5025104/collections/ZLPY5WLF')).toBe(
      'https://www.zotero.org/groups/5025104/collections/ZLPY5WLF'
    )

    expect(
      prefixLegacyUrl(
        '5025104/article_durassavoie-bernard/collections/ZLPY5WLF'
      )
    ).toBe(
      'https://www.zotero.org/groups/5025104/article_durassavoie-bernard/collections/ZLPY5WLF'
    )
  })

  test.each(
    [
      'https://api.zotero.org/users/4922242/collections/ZWU5CAC8',
      'https://www.zotero.org/groups/2381910/revue_f%C3%A9mur/collections/P3JEQVU4/items/6VR4JGQX/collection',
    ],
    'do not prefix fully resolved URLs',
    (url) => {
      expect(prefixLegacyUrl(url)).toBe(url)
    }
  )

  test("do not prefix something that's shady", () => {
    expect(prefixLegacyUrl('5025104/aaaa/ZLPY5WLF')).toBe(
      '5025104/aaaa/ZLPY5WLF'
    )

    expect(prefixLegacyUrl()).toBeUndefined()
  })
})
