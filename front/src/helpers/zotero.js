import LinkHeader from 'http-link-header'
import { filter } from './bibtex'

/**
 * @typedef ZoteroCollection
 * @property {ZoteroCollectionData} data
 * @property {string} key
 * @property {ZoteroLibrary} library
 * @property {Object.<string, HTMLLink>} links
 * @property {ZoteroMeta} meta
 * @property {number} version
 */

/**
 * @typedef ZoteroCollectionData
 * @property {string} key
 * @property {string} name Name of the collection
 * @property {string} parentCollection Parent collection key
 * @property {number} version
 */

/**
 * @typedef ZoteroLibrary
 * @property {number} id
 * @property {Object.<string, HTMLLink>} links
 * @property {string} name Name of the library
 * @property {string} type Enum of 'user' or 'group' (whom it belongs)
 */

/**
 * @typedef ZoteroMeta
 * @property {number} numCollections
 * @property {number} numItems
 */

/**
 * @typedef HTMLLink
 * @property {string} href
 * @property {string} type Mime-Type of the link
 */

/**
 * Get the next link from headers.
 * @param headers HTTP headers (from a response)
 * @returns {URL|null}
 */
function getNextLink(headers) {
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
 * @param {URL} url
 * @param {string} key Zotero API key
 * @param {object[]} agg
 * @returns {Promise<string[]>} a list of JSON responses
 */
async function fetchAllJSON(url, key, agg = []) {
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
async function fetchAllBibTeX(url, key, agg = []) {
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
 * @param {string} url
 * @returns {Promise<string>} - a JSON response
 */
function fetchJSON(url) {
  return fetch(url).then((response) => response.json())
}

/**
 * @param {string} token Zotero API token
 * @returns {Promise<object>} - a JSON response (contains userID and key)
 */
function fetchUserFromToken(token) {
  return fetchJSON(`https://api.zotero.org/keys/${token}`)
}

/**
 * @param {string} userID
 * @param {string} key Zotero API key
 * @returns {Promise<ZoteroCollection[]>} - a list of Zotero collections
 */
async function fetchAllCollections({ userID, key }) {
  // let collections = []
  const url = new URL(`https://api.zotero.org/users/${userID}/groups`)
  const groups = (await fetchAllJSON(url, key)).flat()

  const groupCollections = await Promise.all(
    groups.map((group) => {
      return fetchAllJSON(new URL(`${group.links.self.href}/collections`), key)
    })
  ).then((groups) => [].concat(...groups.flat()))
  // concat dissolves empty arrays (groups without collections)

  // snowpack@3.2 cannot transform this for Safari11
  // for await (const group of groups) {
  //   collections = collections.concat(
  //     await fetchJSON(
  //       `${group.links.self.href}/collections?key=${key}`
  //     )
  //   )
  // }
  const userCollections = await fetchUserCollections({ userID, key })

  return userCollections.concat(groupCollections)
}

/**
 * @param {string} token
 * @returns {Promise<ZoteroCollection[]>}
 */
export async function fetchAllCollectionsPerLibrary({ token }) {
  const { userID, key } = await fetchUserFromToken(token)

  return fetchAllCollections({ userID, key })
}

/**
 *
 * @param token
 * @param token.userID
 * @param token.key
 * @returns {Promise<ZoteroCollection[]>}
 */
export async function fetchUserCollections({ userID, key }) {
  return fetchAllJSON(
    new URL(`https://api.zotero.org/users/${userID}/collections`),
    key
  ).then((all) => all.flat())
}

/**
 * @param collectionHref.collectionHref
 * @param collectionHref
 * @param key Zotero API key
 * @param collectionHref.token
 * @returns {Promise<string>}
 */
export const fetchBibliographyFromCollectionHref = async ({
  collectionHref,
  token: key = null,
}) => {
  return (await fetchAllBibTeX(new URL(collectionHref + '/items'), key)).join(
    '\n'
  )
}
