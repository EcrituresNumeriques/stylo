import LinkHeader from 'http-link-header'

/**
 * @param {*} zoteroLink - format "2478772/collections/UGF4W4PZ"
 */
export function fetchBibliographyFromCollection (zoteroLink) {
    const url = new URL(`https://api.zotero.org/groups/${zoteroLink}/items`)
    url.searchParams.set('format', 'bibtex')

    return fetchZoteroFromUrl(url, [])
}

function getNextLink (headers) {
    if (!headers.has('Link') || headers.get('Link') === '') {
        return null
    }

    const links = LinkHeader.parse(headers.get('Link'))
    // response has a Link header with a rel=next which indicate that there a next page
    const linkNext = links.refs.find(ref => ref.rel === 'next')
    return linkNext && linkNext.uri ? new URL(linkNext.uri) : null
}

export async function fetchZoteroFromUrl (url, agg = []) {
    const response = await fetch(url.toString(), {
      method: 'GET',
      credentials: 'same-origin',
      'Zotero-API-Version': '3'
    })

    const { headers } = response
    const bib = await response.text()

    agg.push(bib)

    const nextLink = getNextLink(headers)

    if (nextLink) {
        await fetchZoteroFromUrl(nextLink, agg)
    }

    return agg
}