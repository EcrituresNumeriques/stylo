const git = require('isomorphic-git')
const Corpus = require('../models/corpus')

function slugify(str) {
  return (
    (str || 'untitled')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 60) || 'untitled'
  )
}

async function buildCorpusRepo({ fs, dir, gitdir, corpusId }) {
  const corpus = await Corpus.findById(corpusId)
  if (!corpus) {
    const err = new Error(`Corpus not found: ${corpusId}`)
    err.status = 404
    throw err
  }
  await git.init({
    fs,
    dir,
    gitdir,
  })

  const articles = await corpus.getArticles()

  const allOids = new Set()
  const usedSlugs = new Map()
  const treeEntries = []

  for (const { article } of articles) {
    const wv = article.workingVersion || {}

    let slug = slugify(article.title)
    if (usedSlugs.has(slug)) {
      const n = usedSlugs.get(slug) + 1
      usedSlugs.set(slug, n)
      slug = `${slug}-${n}`
    } else {
      usedSlugs.set(slug, 1)
    }

    const mdOid = await git.writeBlob({
      fs,
      dir,
      gitdir,
      blob: Buffer.from(wv.md || '', 'utf8'),
    })
    const bibOid = await git.writeBlob({
      fs,
      dir,
      gitdir,
      blob: Buffer.from(wv.bib || '', 'utf8'),
    })
    const metaOid = await git.writeBlob({
      fs,
      dir,
      gitdir,
      blob: Buffer.from(JSON.stringify(wv.metadata || {}), 'utf8'),
    })
    allOids.add(mdOid)
    allOids.add(bibOid)
    allOids.add(metaOid)

    // Tree entries must be sorted for consistent object hashes
    const articleTreeOid = await git.writeTree({
      fs,
      dir,
      gitdir,
      tree: [
        { mode: '100644', path: 'bibliography.bib', oid: bibOid, type: 'blob' },
        { mode: '100644', path: 'metadata.json', oid: metaOid, type: 'blob' },
        { mode: '100644', path: 'text.md', oid: mdOid, type: 'blob' },
      ],
    })
    allOids.add(articleTreeOid)

    treeEntries.push({
      mode: '040000',
      path: slug,
      oid: articleTreeOid,
      type: 'tree',
    })
  }

  const rootTreeOid = await git.writeTree({
    fs,
    dir,
    gitdir,
    tree: treeEntries,
  })
  allOids.add(rootTreeOid)

  const timestamp = Math.floor(
    (corpus.updatedAt || new Date()).getTime() / 1000
  )
  const commitOid = await git.writeCommit({
    fs,
    dir,
    gitdir,
    commit: {
      tree: rootTreeOid,
      parent: [],
      author: {
        name: 'Stylo',
        email: 'stylo@ecrituresnumeriques.ca',
        timestamp,
        timezoneOffset: 0,
      },
      committer: {
        name: 'Stylo',
        email: 'stylo@ecrituresnumeriques.ca',
        timestamp,
        timezoneOffset: 0,
      },
      message: `${corpus.name}\n`,
    },
  })
  allOids.add(commitOid)

  await fs.promises.writeFile(`${gitdir}/HEAD`, 'ref: refs/heads/main\n')
  await fs.promises.writeFile(`${gitdir}/refs/heads/main`, `${commitOid}\n`)

  return { fs, dir, gitdir, commitOid, allOids }
}

/**
 * PKT-LINE format (git smart HTTP protocol)
 * https://git-scm.com/docs/protocol-common#_pkt_line_format
 * @param str
 * @returns {Buffer<ArrayBuffer>}
 */
function pktLine(str) {
  const data =
    typeof str === 'string' ? Buffer.from(str, 'utf8') : Buffer.from(str)
  const len = (data.length + 4).toString(16).padStart(4, '0')
  return Buffer.concat([Buffer.from(len, 'ascii'), data])
}

/**
 * Flush PKT-LINE.
 * Reference: https://git-scm.com/docs/protocol-common#_pkt_line_format
 * @type {Buffer<ArrayBuffer>}
 */
const FLUSH_PKT = Buffer.from('0000', 'ascii')

/**
 * Encode des données dans un canal side-band (protocole smart HTTP).
 * Chaque paquet est une PKT-LINE dont le premier octet est le numéro de canal :
 *   - 1 (data)     : données primaires (ici le report-status)
 *   - 2 (progress) : messages affichés par le client avec le préfixe « remote: »
 *   - 3 (error)    : message d'erreur fatale
 * Reference: https://git-scm.com/docs/protocol-capabilities#_side_band_side_band_64k
 * @param {1|2|3} channel
 * @param {string|Buffer} data
 * @returns {Buffer<ArrayBuffer>}
 */
function sideBand(channel, data) {
  const payload = typeof data === 'string' ? Buffer.from(data, 'utf8') : data
  return pktLine(Buffer.concat([Buffer.from([channel]), payload]))
}

/**
 * Parse le corps d'une requête git-receive-pack.
 * Format : une liste de commandes en PKT-LINE (les capabilities sont collées
 * à la première, après un octet NUL), un flush-pkt, puis le packfile binaire.
 * Reference: https://git-scm.com/docs/pack-protocol#_reference_update_request_and_packfile_transfer
 * @param {Buffer} body
 * @returns {{ commands: { oldOid: string, newOid: string, ref: string }[], capabilities: string[], pack: Buffer }}
 */
function parseReceivePackRequest(body) {
  const commands = []
  let capabilities = []
  let offset = 0

  while (offset + 4 <= body.length) {
    const lenHex = body.toString('ascii', offset, offset + 4)
    if (lenHex === '0000') {
      // flush-pkt : fin de la liste des commandes, le packfile suit
      offset += 4
      break
    }
    const len = parseInt(lenHex, 16)
    if (Number.isNaN(len) || len < 4) {
      break
    }
    let line = body.subarray(offset + 4, offset + len)
    offset += len

    // Sur la première ligne, les capabilities suivent un octet NUL.
    const nul = line.indexOf(0x00)
    if (nul !== -1) {
      capabilities = line
        .subarray(nul + 1)
        .toString('utf8')
        .trim()
        .split(' ')
        .filter(Boolean)
      line = line.subarray(0, nul)
    }

    const [oldOid, newOid, ref] = line.toString('utf8').trim().split(' ')
    commands.push({ oldOid, newOid, ref })
  }

  return { commands, capabilities, pack: body.subarray(offset) }
}

module.exports = {
  buildCorpusRepo,
  pktLine,
  FLUSH_PKT,
  sideBand,
  parseReceivePackRequest,
}
