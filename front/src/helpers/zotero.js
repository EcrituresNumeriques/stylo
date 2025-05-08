import LinkHeader from 'http-link-header'
import { filter } from './bibtex'

const baseApiUrl = 'https://api.zotero.org/'
const baseWebUrl = 'https://www.zotero.org/'

/**
 *
 * @param {URL|string} url
 * @param {RequestInit?} fetchOptions
 * @param {number?} retries
 * @returns {Promise<Response>}
 */
async function retryFetch(url, fetchOptions = {}, retries = 3) {
  const initialRetries = retries

  while (retries--) {
    const response = await fetch(url?.toString(), fetchOptions)

    if (response.ok) {
      return response
    } else {
      await new Promise((resolve) =>
        setTimeout(resolve, (initialRetries / retries) * 200)
      )
    }
  }

  throw new Error('Maximum attempts reached')
}

/**
 * @typedef ZoteroCollection
 * @property {ZoteroCollectionData} data
 * @property {string} key
 * @property {ZoteroLibrary} library
 * @property {{[key: string]: HTMLLink}} links
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
 * @property {{[key: string]: HTMLLink}} links
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
 * @typedef {object} ZoteroKeyResponse
 * @property {string} userID
 * @property {string} key
 * @property {string} username
 * @property {string} displayName
 */

/**
 *
 * @param {string} url
 * @returns {boolean}
 */
export function isApiUrl(url) {
  return /^https:\/\/api.zotero.org\/(users|groups)\/\d+\//i.test(url)
}

/**
 *
 * @param {string} url
 * @returns {boolean}
 */
export function isWebUrl(url) {
  return url.startsWith(baseWebUrl)
}

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
 * @param {URL} from
 * @param {URL} to
 * @returns {URL}
 */
function copySearchParams(from, to) {
  from.searchParams.forEach((value, key) => {
    if (!to.searchParams.has(key)) {
      to.searchParams.set(key, value)
    }
  })

  return to
}

/**
 *
 * @param {URL} initialUrl
 * @param {'json' | 'text'} resolveAs
 * @returns {Generator<string[]|Object[]>} a list of aggregated responses
 */
async function fetchAll(initialUrl, resolveAs = 'json') {
  const agg = []
  let url = initialUrl
  const options = {
    method: 'GET',
    credentials: 'same-origin',
    'Zotero-API-Version': '3',
  }

  while (url) {
    copySearchParams(initialUrl, url)
    const response = await retryFetch(url, options)

    if (response.ok) {
      const data = await response[resolveAs]()
      agg.push(data)

      url = getNextLink(response.headers)
    }
  }

  return agg.flat()
}

/**
 * @param {string} token Zotero API token
 * @returns {Promise<ZoteroKeyResponse>} - a JSON response (contains userID and key)
 */
async function fetchUserFromToken(token) {
  const response = await retryFetch(`https://api.zotero.org/keys/${token}`)

  return response.json()
}

/**
 * @param {string} token
 * @returns {Promise<ZoteroCollection[]>} - a list of user related collections
 */
export async function fetchUserCollections(token) {
  const { userID, key } = await fetchUserFromToken(token)

  const [allGroups, userCollections] = await Promise.all([
    fetchUserGroups({ userID, key }),
    fetchUserLibraryCollections({ userID, key }),
  ])

  const groupCollections = await Promise.all(
    allGroups.map((group) => {
      const url = new URL(`${group.links.self.href}/collections`)
      url.searchParams.set('key', key)
      url.searchParams.set('format', 'json')
      return fetchAll(url)
    })
  ).then((groups) => [].concat(...groups.flat()))
  // concat dissolves empty arrays (groups without collections)

  return userCollections.concat(groupCollections)
}

/**
 *
 * @param {object} token
 * @param {string} token.userID
 * @param {string} token.key
 * @returns {Promise<ZoteroCollection[]>}
 */
export async function fetchUserLibraryCollections({ userID, key }) {
  const url = new URL(`https://api.zotero.org/users/${userID}/collections`)
  url.searchParams.set('key', key)
  url.searchParams.set('format', 'json')

  return fetchAll(url)
}

/**
 *
 * @param {object} token
 * @param {string} token.userID
 * @param {string} token.key
 * @returns {Promise<ZoteroCollection[]>}
 */
export async function fetchUserGroups({ userID, key }) {
  const url = new URL(`https://api.zotero.org/users/${userID}/groups`)
  url.searchParams.set('key', key)
  url.searchParams.set('format', 'json')

  return fetchAll(url)
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
  const url = new URL(collectionHref)
  url.searchParams.set('format', 'bibtex')

  if (key) {
    url.searchParams.set('key', key)
  }

  return fetchAll(url, 'text').then((responses) =>
    responses
      .map((bib) => filter(bib))
      .filter((d) => d)
      .join('\n')
  )
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
  let strategy = null

  // https://www.zotero.org/{username}
  // https://www.zotero.org/{username}/library
  // https://www.zotero.org/{username}/collections/{collectionId}
  // https://www.zotero.org/{username}/collections/{collectionId}/items/{itemId}/collection
  // https://www.zotero.org/groups/{groupId}/articlesamroute/library
  // https://www.zotero.org/groups/{groupId}/article_durassavoie-bernard/collections/{collectionId}
  // https://www.zotero.org/groups/{groupId}/article_durassavoie-bernard/collections/{collectionId}/items/{itemId}/collection
  const GROUP_RE =
    /zotero.org\/(groups\/(?<groupId>\d+)(\/[^/]+)?|(?<username>[^/]+))(\/collections\/(?<collectionId>[A-Z0-9]+))?(\/items\/(?<itemId>[A-Z0-9]+))?(\/tags\/(?<tag>[^/]+))?(\/(?<action>collection|library|item-list|trash))?$/

  // https://api.zotero.org/users/{userId}[/items]?
  // https://api.zotero.org/users/{userId}/collections/{collectionId}[/items]?
  // https://api.zotero.org/groups/{groupId}[/items]?
  const API_RE =
    /api.zotero.org\/(users\/(?<userId>\d+)|groups\/(?<groupId>\d+))(\/collections\/(?<collectionId>[A-Z0-9]+))?(\/(?<action>items\/top|items\/trash|items))?$/

  if (isApiUrl(plainUrl)) {
    strategy = 'API'
  } else if (isWebUrl(plainUrl)) {
    strategy = 'WEB'
  } else {
    throw new Error('This is not a Zotero URL')
  }

  if (
    strategy === 'WEB' &&
    !plainUrl.startsWith('https://www.zotero.org/groups/') &&
    !token
  ) {
    throw new Error('A token is required to fetch personal items.')
  }

  const result = plainUrl.match(strategy === 'WEB' ? GROUP_RE : API_RE)

  let {
    username,
    userId,
    groupId,
    collectionId,
    itemId,
    tag,
    action = 'items',
  } = result.groups

  if (tag) {
    throw new Error('Cannot fetch items associated to a tag.')
  }

  if (strategy === 'WEB' && username) {
    const user = await fetchUserFromToken()

    if (user.username !== username) {
      throw new Error('Cannot fetch another member personal library')
    }

    userId = user.userID
  }

  if (strategy === 'WEB' && ['library', 'collection', 'items-list'].includes(action)) {
    action = 'items'
  }

  const path = [
    // either one of them
    userId && `users/${userId}`,
    groupId && `groups/${groupId}`,
    // either a collection or an item
    collectionId && !itemId && `collections/${collectionId}`,
    itemId && `items/${itemId}`,
    // if it's not an item, it might have an action associated to it
    !itemId && `${action}`,
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
