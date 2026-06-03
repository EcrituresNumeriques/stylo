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

  return { commitOid, oids: [commitOid, treeOid, blobOid] }
}

module.exports = {
  createGitRepository,
}
