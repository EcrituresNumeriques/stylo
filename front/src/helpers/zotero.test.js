import { describe, test, expect, vi } from 'vitest'
import { fetchBibliographyFromCollectionHref } from './zotero'

describe('fetchBibliographyFromCollection', () => {
  fetch
    .mockResolvedValueOnce({
      headers: new Headers({ Link: '<https://api.zotero.org/page/2>; rel="next"' }),
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
}`)
    })
    .mockResolvedValueOnce({
      headers: new Headers({ Link: '<https://api.zotero.org/page/3>; rel="next"' }),
      text: vi.fn().mockResolvedValue('')
    })
    .mockResolvedValueOnce({
      headers:new Headers({}),
      text: vi.fn().mockResolvedValue(`
@misc{grossetie_test_nodate,
	type = {yuzutech.fr},
	title = {test},
	journal = {How to},
	author = {GROSSETIE, guillaume},
}`)
    })


  test('fetches a paginated collection of more than 25 elements', async () => {
    const zoteroId = '2478772/collections/UGF4W4PZ'
    const bib = await fetchBibliographyFromCollectionHref({
      collectionHref: `https://api.zotero.org/groups/${zoteroId}`,
    })

    return expect(bib).toMatchFileSnapshot('__snapshots__/zotero/group-collection.bib')
  })
})
