import LinkHeader from 'http-link-header'
import { bindActionCreators } from 'redux'

export const fetchBibliographyFromGroupSuffix = zoteroLink => fetchBibliographyFromCollection(`groups/${zoteroLink}/items`)
export const fetchBibliographyFromCollectionId = async ({collectionId, token}) => {
    const {key, userID} = await fetchUserFromToken(token)
    return fetchBibliographyFromCollection(`users/${userID}/collections/${collectionId}/items`, key)
}

/**
 * @param {*} zoteroLink - format "2478772/collections/UGF4W4PZ"
 */
export function fetchBibliographyFromCollection (endpoint, key = null) {
    const url = new URL(`https://api.zotero.org/${endpoint}`)
    url.searchParams.set('format', 'bibtex')
    if (key) {
        url.searchParams.set('key', key)
    }

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

    if (bib && bib.trim().length > 0) {
        agg.push(bib)
    }

    const nextLink = getNextLink(headers)

    if (nextLink) {
        await fetchZoteroFromUrl(nextLink, agg)
    }

    return agg
}

function fetchUserFromToken(token) {
    return fetch(`https://api.zotero.org/keys/${token}`)
        .then(response => response.json())
}

export async function fetchUserCollections({ token }) {
    const {userID, username, key} = await fetchUserFromToken(token)

    return fetch(`https://api.zotero.org/users/${userID}/collections?key=${key}`)
        .then(response => response.json())
}
