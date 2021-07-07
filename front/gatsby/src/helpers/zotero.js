import LinkHeader from 'http-link-header'
import { filter } from './bibtex'

/**
 * Get the next link from headers.
 * @param headers HTTP headers (from a response)
 * @returns {URL|null}
 */
function getNextLink (headers) {
  if (!headers.has('Link') || headers.get('Link') === '') {
    return null
  }
  const links = LinkHeader.parse(headers.get('Link'))
  // response has a Link header with a rel=next which indicate that there a next page
  const linkNext = links.refs.find((ref) => ref.rel === 'next')

  return linkNext && linkNext.uri ? new URL(linkNext.uri) : null
}

/**
 *
 * @param url
 * @param key Zotero API key
 * @param agg
 * @returns {Promise<string[]>} - a list of JSON responses
 */
async function fetchAllJSON (url, key, agg = []) {
  if (key) {
    url.searchParams.set('key', key)
  }
  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'same-origin',
    'Zotero-API-Version': '3',
  })

  const { headers } = response
  const json = await response.json()

  if (json) {
    agg.push(json)
  }

  const nextLink = getNextLink(headers)

  if (nextLink) {
    await fetchAllJSON(nextLink, key, agg)
  }

  return agg
}

/**
 * @param url
 * @param key Zotero API key
 * @param agg
 * @returns {Promise<string[]>} - a list of bibliographical references (as BibTeX)
 */
async function fetchAllBibTeX (url, key, agg = []) {
  if (key) {
    url.searchParams.set('key', key)
  }
  url.searchParams.set('format', 'bibtex')
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
    await fetchAllBibTeX(nextLink, key, agg)
  }

  return agg
}

/**
 * @param url
 * @returns {Promise<string>} - a JSON response
 */
function fetchJSON (url) {
  return fetch(url).then((response) => response.json())
}

/**
 * @param token Zotero API token
 * @returns {Promise<object>} - a JSON response (contains userID and key)
 */
function fetchUserFromToken (token) {
  return fetchJSON(`https://api.zotero.org/keys/${token}`)
}

/**
 * @param userID
 * @param key Zotero API key
 * @returns {Promise<object[]>} - a list of Zotero collections
 */
async function fetchAllCollections ({ userID, key }) {
  // let collections = []
  const url = new URL(`https://api.zotero.org/users/${userID}/groups`)
  const groups = (await fetchAllJSON(url, key)).flat()

  const groupCollections = await Promise.all(groups.map(group => {
    return fetchAllJSON(new URL(`${group.links.self.href}/collections`), key)
  })).then(groups => [].concat(...groups.flat()))
  // concat dissolves empty arrays (groups without collections)

  // snowpack@3.2 cannot transform this for Safari11
  // for await (const group of groups) {
  //   collections = collections.concat(
  //     await fetchJSON(
  //       `${group.links.self.href}/collections?key=${key}`
  //     )
  //   )
  // }
  const userCollections = (await fetchAllJSON(new URL(`https://api.zotero.org/users/${userID}/collections`), key)).flat()

  return groupCollections.concat(userCollections)
}

/**
 * @param token
 * @returns {Promise<{}>}
 */
export async function fetchAllCollectionsPerLibrary ({ token }) {
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

/**
 *
 * @param token
 * @returns {Promise<string>}
 */
export async function fetchUserCollections ({ token }) {
  const { userID, key } = await fetchUserFromToken(token)

  return (await fetchAllJSON(new URL(`https://api.zotero.org/users/${userID}/collections`), key)).flat()
}

/**
 * @param collectionHref
 * @param key Zotero API key
 * @returns {Promise<string[]>}
 */
export const fetchBibliographyFromCollectionHref = async ({ collectionHref, token: key = null, }) => {
  return fetchAllBibTeX(new URL(collectionHref + '/items'), key)
}
