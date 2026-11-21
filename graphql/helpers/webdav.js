const config = require('../config.js')
const { logger } = require('../logger.js')

/**
 * @typedef {object} WebdavAccount
 * @property {string} url base URL of the storage, e.g. https://sharedocs.huma-num.fr/dav.php/@Home/
 * @property {string} username
 * @property {string} token password (or application password)
 */

/**
 * Raster images only: SVG or HTML served from Stylo's origin would run scripts.
 */
const allowedContentTypes = new Set([
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
])

/**
 * Throws when the URL could be used to reach something else than a remote storage.
 * TODO reject private and loopback addresses
 *
 * @param {string} url
 */
function assertStorageUrl(url) {
  const { protocol } = new URL(url)
  const allowed = config.get('env') === 'dev' ? ['https:', 'http:'] : ['https:']

  if (!allowed.includes(protocol)) {
    throw new Error(`Unsupported storage URL protocol: ${protocol}`)
  }
}

/**
 * @param {string} path
 * @returns {string}
 */
function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/')
}

const propfindPermissions = `<?xml version="1.0"?>
<d:propfind xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
  <d:prop><d:resourcetype/><oc:permissions/></d:prop>
</d:propfind>`

/**
 * Minimal multistatus reader, namespace prefixes vary between servers.
 *
 * @param {string} xml
 * @returns {{ href: string, isCollection: boolean, permissions?: string }[]}
 */
function parseMultistatus(xml) {
  const responses = xml.match(
    /<(\w+:)?response[\s>][\s\S]*?<\/(\w+:)?response>/g
  )

  return (responses ?? []).map((response) => ({
    href: response.match(/<(?:\w+:)?href>([^<]*)</)?.[1] ?? '',
    isCollection: /<(?:\w+:)?collection\s*\/>/.test(response),
    permissions: response.match(/<(?:\w+:)?permissions>([^<]*)</)?.[1],
  }))
}

/**
 * @param {WebdavAccount} account
 */
function createWebdavClient({ url, username, token }) {
  assertStorageUrl(url)

  const baseUrl = url.endsWith('/') ? url : `${url}/`
  const authorization = `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`

  /**
   * @param {string} method
   * @param {string} path
   * @param {RequestInit} [init]
   * @returns {Promise<Response>}
   */
  function request(method, path, { headers = {}, ...init } = {}) {
    return fetch(new URL(encodePath(path), baseUrl), {
      method,
      headers: { authorization, ...headers },
      redirect: 'manual',
      ...init,
    })
  }

  /**
   * A 405 means the folder may already exist, or that creation is not allowed.
   *
   * @param {string} rootUrl
   * @returns {Promise<boolean>}
   */
  async function canCreateInstanceFolderIn(rootUrl) {
    const folderUrl = new URL(
      `${encodeURIComponent(config.get('attachments.instance'))}/`,
      rootUrl
    )
    const init = { headers: { authorization }, redirect: 'manual' }
    const mkcol = await fetch(folderUrl, { ...init, method: 'MKCOL' })
    logger.info(
      { url: folderUrl.toString(), status: mkcol.status },
      'webdav write probe'
    )
    if (mkcol.status !== 405) {
      return mkcol.status === 201
    }

    const propfind = await fetch(folderUrl, {
      ...init,
      method: 'PROPFIND',
      headers: { authorization, depth: '0' },
    })
    return propfind.status === 207
  }

  return {
    /**
     * Returns the URL where files can be created: the account URL itself,
     * or its first writable folder (`@Home` on FileRun when given `/dav.php/`,
     * the first library on Seafile when given `/seafdav/`).
     *
     * Ownership permissions (FileRun, Nextcloud, ownCloud) tell it directly.
     * Otherwise, we try to create the instance folder, which uploads need anyway.
     *
     * @returns {Promise<string | null>} null when nothing is writable or the credentials are refused
     */
    async findWritableRoot() {
      const response = await request('PROPFIND', '', {
        headers: { depth: '1', 'content-type': 'application/xml' },
        body: propfindPermissions,
      })
      if (response.status !== 207) {
        logger.warn(
          { url: baseUrl, status: response.status },
          'webdav PROPFIND refused'
        )
        return null
      }

      const entries = parseMultistatus(await response.text())
      const isRoot = ({ href }) =>
        decodeURIComponent(new URL(href, baseUrl).pathname) ===
        decodeURIComponent(new URL(baseUrl).pathname)
      const folders = entries
        .filter((entry) => !isRoot(entry) && entry.isCollection)
        .map((entry) => ({
          ...entry,
          url: new URL(entry.href.replace(/\/?$/, '/'), baseUrl).toString(),
        }))

      if (entries.some(({ permissions }) => permissions !== undefined)) {
        const isWritable = ({ permissions }) => /[CK]/.test(permissions ?? '')
        if (isWritable(entries.find(isRoot) ?? {})) {
          return baseUrl
        }
        return folders.find(isWritable)?.url ?? null
      }

      for (const candidate of [baseUrl, ...folders.map(({ url }) => url)]) {
        if (await canCreateInstanceFolderIn(candidate)) {
          return candidate
        }
      }
      return null
    },

    /**
     * Creates each folder of the path, existing ones answer with a 405.
     * @param {string} path
     */
    async ensureCollection(path) {
      const segments = path.split('/').filter(Boolean)

      for (let i = 1; i <= segments.length; i++) {
        const response = await request(
          'MKCOL',
          `${segments.slice(0, i).join('/')}/`
        )

        if (![201, 405].includes(response.status)) {
          throw new Error(
            `Unable to create the folder ${path} (${response.status})`
          )
        }
      }
    },

    /**
     * Uploads a file, overwriting any existing one.
     * @param {string} path
     * @param {Buffer} body
     * @param {string} contentType
     * @returns {Promise<{ etag: string | null }>}
     */
    async put(path, body, contentType) {
      const response = await request('PUT', path, {
        headers: { 'content-type': contentType },
        body,
      })

      if (![200, 201, 204].includes(response.status)) {
        throw new Error(`Unable to upload ${path} (${response.status})`)
      }

      return { etag: response.headers.get('etag') }
    },

    /**
     * @param {string} path
     * @param {{ ifNoneMatch?: string }} [options]
     * @returns {Promise<Response>}
     */
    get(path, { ifNoneMatch } = {}) {
      return request('GET', path, {
        headers: ifNoneMatch ? { 'if-none-match': ifNoneMatch } : {},
      })
    },
  }
}

/**
 * Known servers, recognized by their WebDAV endpoint and, when they have one,
 * confirmed by their public status page.
 */
const knownServers = [
  { kind: 'nextcloud', endpoint: /\/remote\.php\//, status: 'status.php' },
  { kind: 'filerun', endpoint: /\/dav\.php\// },
  { kind: 'seafile', endpoint: /\/seafdav\//, status: 'api2/server-info/' },
]

/**
 * @param {string} url WebDAV URL of the account
 * @returns {Promise<{ kind: string | null, webUrl: string | null }>}
 */
async function detectServer(url) {
  const { origin, pathname } = new URL(url)

  for (const { kind, endpoint, status } of knownServers) {
    const match = pathname.match(endpoint)
    if (!match) continue

    const webUrl = `${origin}${pathname.slice(0, match.index)}/`
    const confirmed =
      !status ||
      (await fetch(new URL(status, webUrl), { redirect: 'manual' })
        .then((response) => response.ok)
        .catch(() => false))

    return confirmed ? { kind, webUrl } : { kind: null, webUrl: null }
  }

  return { kind: null, webUrl: null }
}

/**
 * Link to browse a folder in the web interface of the storage, when the server is known.
 * Only Nextcloud links to the folder itself, others link to their home page.
 *
 * @param {{ url: string, kind?: string | null, webUrl?: string | null }} account
 * @param {string} path folder path relative to the account URL
 * @returns {string | null}
 */
function browseUrl({ url, kind, webUrl }, path) {
  if (!kind || !webUrl) {
    return null
  }

  if (kind === 'nextcloud') {
    const root = decodeURIComponent(new URL(url).pathname).replace(
      /^.*\/remote\.php\/(?:dav\/files\/[^/]+|webdav)\//,
      '/'
    )
    return `${webUrl}index.php/apps/files/?dir=${encodeURIComponent(`${root}${path}`)}`
  }

  return webUrl
}

module.exports = {
  allowedContentTypes,
  assertStorageUrl,
  browseUrl,
  createWebdavClient,
  detectServer,
  encodePath,
}
