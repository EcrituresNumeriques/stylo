import { describe, test, expect } from 'vitest'
import { fetchBibliographyFromCollectionHref } from './zotero'

describe('fetchBibliographyFromCollection', () => {
  test('fetches a paginated collection of more than 25 elements', async () => {
    const zoteroId = '2478772/collections/UGF4W4PZ'

    const bib = await fetchBibliographyFromCollectionHref({
      collectionHref: `https://api.zotero.org/groups/${zoteroId}`,
    })

    return expect(bib).toMatchFileSnapshot('__snapshots__/zotero/group-collection.bib')
  })
})
