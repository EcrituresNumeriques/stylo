import LinkHeader from 'http-link-header'
import { filter } from './bibtex'

/**
 * @typedef ZoteroCollection
 * @property {ZoteroCollectionData} data
 * @property {String} key
 * @property {ZoteroLibrary} library
 * @property {Object.<string, HTMLLink>} links
 * @property {ZoteroMeta} meta
 * @property {Number} version
 */

/**
 * @typedef ZoteroCollectionData
 * @property {String} key
 * @property {String} name Name of the collection
 * @property {String} parentCollection Parent collection key
 * @property {Number} version
 */

/**
 * @typedef ZoteroLibrary
 * @property {Number} id
 * @property {Object.<string, HTMLLink>} links
 * @property {String} name Name of the library
 * @property {String} type Enum of 'user' or 'group' (whom it belongs)
 */

/**
 * @typedef ZoteroMeta
 * @property {Number} numCollections
 * @property {Number} numItems
 */

/**
 * @typedef HTMLLink
 * @property {String} href
 * @property {String} type Mime-Type of the link
 */


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
 * @param {URL} url
 * @param {String} key Zotero API key
 * @param {Object[]} agg
 * @returns {Promise<string[]>} a list of JSON responses
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
 * @param {String} url
 * @returns {Promise<string>} - a JSON response
 */
function fetchJSON (url) {
  return fetch(url).then((response) => response.json())
}

/**
 * @param {String} token Zotero API token
 * @returns {Promise<object>} - a JSON response (contains userID and key)
 */
function fetchUserFromToken (token) {
  return fetchJSON(`https://api.zotero.org/keys/${token}`)
}

/**
 * @param {String} userID
 * @param {String} key Zotero API key
 * @returns {Promise<ZoteroCollection[]>} - a list of Zotero collections
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
  const userCollections = await fetchUserCollections({ userID, key })

  return userCollections.concat(groupCollections)
}

/**
 * @param {String} token
 * @returns {Promise<ZoteroCollection[]>}
 */
export async function fetchAllCollectionsPerLibrary ({ token }) {
  const { userID, key } = await fetchUserFromToken(token)

  return fetchAllCollections({ userID, key })
}

/**
 *
 * @param token
 * @returns {Promise<ZoteroCollection[]>}
 */
export async function fetchUserCollections ({ userID, key }) {
  return fetchAllJSON(new URL(`https://api.zotero.org/users/${userID}/collections`), key)
    .then((all) => all.flat())
}

/**
 * @param collectionHref
 * @param key Zotero API key
 * @returns {Promise<string[]>}
 */
export const fetchBibliographyFromCollectionHref = async ({ collectionHref, token: key = null, }) => {
  return fetchAllBibTeX(new URL(collectionHref + '/items'), key)
}
