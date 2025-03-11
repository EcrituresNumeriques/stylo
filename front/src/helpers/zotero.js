import LinkHeader from 'http-link-header'
import { filter } from './bibtex'

const baseApiUrl = 'https://api.zotero.org/'
const baseWebUrl = 'https://www.zotero.org/'

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
 * @typedef {Object} ZoteroKeyResponse
 * @property {string} userID
 * @property {string} key
 * @property {string} username
 * @property {string} displayName
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
 * @param {URL} url
 * @param {string} key Zotero API key
 * @param {string[]=} agg
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
 * @param {string} token Zotero API token
 * @returns {Promise<ZoteroKeyResponse>} - a JSON response (contains userID and key)
 */
function fetchUserFromToken(token) {
  return fetch(`https://api.zotero.org/keys/${token}`).then((response) =>
    response.json()
  )
}

/**
 * @param {object} options
 * @param {string} options.userID
 * @param {string} options.key Zotero API key
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

  const userCollections = await fetchUserCollections({ userID, key })

  return userCollections.concat(groupCollections)
}

/**
 * @param {object} options
 * @param {string} options.token
 * @returns {Promise<ZoteroCollection[]>}
 */
export async function fetchAllCollectionsPerLibrary({ token }) {
  const { userID, key } = await fetchUserFromToken(token)

  return fetchAllCollections({ userID, key })
}

/**
 *
 * @param {object} token
 * @param {string} token.userID
 * @param {string} token.key
 * @returns {Promise<ZoteroCollection[]>}
 */
export async function fetchUserCollections({ userID, key }) {
  return fetchAllJSON(
    new URL(`https://api.zotero.org/users/${userID}/collections`),
    key
  ).then((all) => all.flat())
}

/**
 * @param {object} options
 * @param {string} options.collectionHref
 * @param {string=} options.token
 * @returns {Promise<string>}
 */
export async function fetchBibliographyFromCollectionHref({
  collectionHref,
  token: key = null,
}) {
  return (await fetchAllBibTeX(new URL(collectionHref), key)).join('\n')
}

/**
 * Converts a Zotero Web URL (group, collection, etc.) into a Zotero API URL
 * If a token is provided, it does its best to translate userIds and groupIds.
 * @see https://github.com/EcrituresNumeriques/stylo/issues/816#issuecomment-1419418761
 * @param {string} plainUrl
 * @param {string=} token
 * @returns {Promise<string>} Zotero API URL
 */
export async function toApiUrl(plainUrl, token) {
  // https://www.zotero.org/{username}
  // https://www.zotero.org/{username}/library
  // https://www.zotero.org/{username}/collections/{collectionId}
  // https://www.zotero.org/{username}/collections/{collectionId}/items/{itemId}/collection
  // https://www.zotero.org/groups/{groupId}/articlesamroute/library
  // https://www.zotero.org/groups/{groupId}/article_durassavoie-bernard/collections/{collectionId}
  // https://www.zotero.org/groups/{groupId}/article_durassavoie-bernard/collections/{collectionId}/items/{itemId}/collection
  const GROUP_RE =
    /zotero.org\/(groups\/(?<groupId>\d+)(\/[^/]+)?|(?<username>[^/]+))(\/collections\/(?<collectionId>[A-Z0-9]+))?(\/items\/(?<itemId>[A-Z0-9]+))?(\/tags\/(?<tag>[^/]+))?(\/(?<action>collection|library|item-list|trash))?$/

  if (/https:\/\/api.zotero.org\/(users|groups)\/\d+\//i.test(plainUrl)) {
    return plainUrl
  }

  if (!plainUrl.startsWith(baseWebUrl)) {
    throw new Error('This is not a Zotero URL')
  }

  if (!plainUrl.startsWith('https://www.zotero.org/groups/') && !token) {
    throw new Error('A token is required to fetch personal items.')
  }

  const result = plainUrl.match(GROUP_RE)

  let userId = null
  const { username, groupId, collectionId, itemId, tag, action } = result.groups

  if (tag) {
    throw new Error('Cannot fetch items associated to a tag.')
  }

  if (username) {
    const user = await fetchUserFromToken()

    if (user.username !== username) {
      throw new Error('Cannot fetch another member personal library')
    }

    userId = user.userID
  }

  const path = [
    userId && `users/${userId}`,
    groupId && `groups/${groupId}`,
    collectionId || itemId ? '' : 'items',
    collectionId && !itemId && `collections/${collectionId}/items`,
    itemId && `items/${itemId}`,
  ]
    .filter(Boolean)
    .join('/')

  return baseApiUrl + path
}

/**
 *
 * @param {string=} urlSuffix
 * @returns {string|undefined}
 */
export function prefixLegacyUrl(urlSuffix) {
  const MAYBE_ZOTERO_RE = /^\d+\/([^/]+\/)?collections\/[A-Z0-9]+/

  if (typeof urlSuffix === 'string') {
    const suffix = urlSuffix.replace(/[[\]]/g, '')

    if (MAYBE_ZOTERO_RE.test(suffix)) {
      return `${baseWebUrl}groups/${suffix}`
    }
  }

  return urlSuffix
}
