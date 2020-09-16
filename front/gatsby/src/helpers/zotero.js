import LinkHeader from 'http-link-header'

export const fetchBibliographyFromCollectionHref = async ({collectionHref, token: key = null}) => {
    const url = new URL(collectionHref + '/items')
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

async function fetchUserFromToken(token) {
    return fetch(`https://api.zotero.org/keys/${token}`)
        .then(response => response.json())
}

async function fetchAllCollections({userID, key}) {
    let collections = []
    const groups = await fetch(`https://api.zotero.org/users/${userID}/groups?key=${key}`).then(response => response.json())
    for await(const group of groups) {
      collections = collections.concat(await fetch(`${group.links.self.href}/collections?key=${key}`).then(response => response.json()))
    }
    collections = collections.concat(await fetch(`https://api.zotero.org/users/${userID}/collections?key=${key}`).then(response => response.json()))
    return collections
}

export async function fetchAllCollectionsPerLibrary({ token }) {
    const {userID, key} = await fetchUserFromToken(token)
    const collections = await fetchAllCollections({userID, key})
    const result = {}
    for (const collection of collections) {
        const key = collection.library.type + '-' + collection.library.name
        const lib = result[key] || []
        lib.push(collection)
        result[key] = lib
    }
    return result
}

export async function fetchUserCollections({ token }) {
    const {userID, key} = await fetchUserFromToken(token)

    return fetch(`https://api.zotero.org/users/${userID}/collections?key=${key}`)
        .then(response => response.json())
}
