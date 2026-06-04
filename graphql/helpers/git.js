const git = require('isomorphic-git')

async function createGitRepository({ fs, dir, gitdir }) {
  await git.init({
    fs,
    dir,
    gitdir,
  })
  const blobOid = await git.writeBlob({
    fs,
    dir,
    gitdir,
    blob: Buffer.from('aaa', 'utf8'),
  })
  const treeOid = await git.writeTree({
    fs,
    dir,
    gitdir,
    tree: [{ mode: '100644', path: 'text.md', oid: blobOid, type: 'blob' }],
  })
  const timestamp = Math.floor(new Date().getTime() / 1000)
  const commitOid = await git.writeCommit({
    fs,
    dir,
    gitdir,
    commit: {
      tree: treeOid,
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
      message: `init\n`,
    },
  })
  await fs.promises.writeFile(`${gitdir}/HEAD`, 'ref: refs/heads/main\n')
  await fs.promises.writeFile(`${gitdir}/refs/heads/main`, `${commitOid}\n`)

  return { commitOid, oids: [commitOid, treeOid, blobOid] }
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

module.exports = {
  createGitRepository,
  pktLine,
  FLUSH_PKT,
}
