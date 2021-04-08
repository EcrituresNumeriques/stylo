import LinkHeader from 'http-link-header'
import { filter } from './bibtex'

export const fetchBibliographyFromCollectionHref = async ({
  collectionHref,
  token: key = null,
}) => {
  const url = new URL(collectionHref + '/items')
  url.searchParams.set('format', 'bibtex')
  if (key) {
    url.searchParams.set('key', key)
  }
  return fetchZoteroFromUrl(url, [])
}

function getNextLink(headers) {
  if (!headers.has('Link') || headers.get('Link') === '') {
    return null
  }

  const links = LinkHeader.parse(headers.get('Link'))
  // response has a Link header with a rel=next which indicate that there a next page
  const linkNext = links.refs.find((ref) => ref.rel === 'next')
  return linkNext && linkNext.uri ? new URL(linkNext.uri) : null
}

export async function fetchZoteroFromUrl(url, agg = []) {
  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'same-origin',
    'Zotero-API-Version': '3',
  })

  const { headers } = response
  const bib = await response.text()

  if (bib && bib.trim().length > 0) {
    agg.push(filter(bib))
  }

  const nextLink = getNextLink(headers)

  if (nextLink) {
    await fetchZoteroFromUrl(nextLink, agg)
  }

  return agg
}

function fetchUserFromToken(token) {
  return fetchJSON(`https://api.zotero.org/keys/${token}`)
}

function fetchJSON(url) {
  return fetch(url).then((response) => response.json())
}

async function fetchAllCollections({ userID, key }) {
  // let collections = []
  const groups = await fetchJSON(`https://api.zotero.org/users/${userID}/groups?key=${key}`)

  const collections = await Promise.all(groups.map(group => {
    return fetchJSON(`${group.links.self.href}/collections?key=${key}`)
  })).then(groups => [].concat(...groups))
  // concat dissolves empty arrays (groups without collections)

  // snowpack@3.2 cannot transform this for Safari11
  // for await (const group of groups) {
  //   collections = collections.concat(
  //     await fetchJSON(
  //       `${group.links.self.href}/collections?key=${key}`
  //     )
  //   )
  // }

  return collections.concat(
    await fetchJSON(`https://api.zotero.org/users/${userID}/collections?key=${key}`)
  )
}

export async function fetchAllCollectionsPerLibrary({ token }) {
  const { userID, key } = await fetchUserFromToken(token)
  const collections = await fetchAllCollections({ userID, key })
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
  const { userID, key } = await fetchUserFromToken(token)

  return fetchJSON(`https://api.zotero.org/users/${userID}/collections?key=${key}`)
}
