'use strict'

// In-memory filesystem compatible with isomorphic-git's `fs` interface.
function createMemFS() {
  const files = new Map()
  const dirs = new Set(['/', '/repo'])

  function makeFileStat(size) {
    const now = Date.now()
    return {
      isFile: () => true,
      isDirectory: () => false,
      isSymbolicLink: () => false,
      size,
      mode: 0o100644,
      mtimeMs: now,
      ctimeMs: now,
      atimeMs: now,
    }
  }

  function makeDirStat() {
    const now = Date.now()
    return {
      isFile: () => false,
      isDirectory: () => true,
      isSymbolicLink: () => false,
      size: 0,
      mode: 0o040755,
      mtimeMs: now,
      ctimeMs: now,
      atimeMs: now,
    }
  }

  const promises = {
    async readFile(filePath) {
      if (!files.has(filePath)) {
        const err = new Error(
          `ENOENT: no such file or directory, open '${filePath}'`
        )
        err.code = 'ENOENT'
        throw err
      }
      return files.get(filePath)
    },

    async writeFile(filePath, data) {
      files.set(filePath, Buffer.isBuffer(data) ? data : Buffer.from(data))
    },

    async unlink(filePath) {
      files.delete(filePath)
    },

    async readdir(dirPath) {
      const prefix = dirPath === '/' ? '/' : `${dirPath}/`
      const result = new Set()
      for (const key of files.keys()) {
        if (key.startsWith(prefix)) {
          const segment = key.slice(prefix.length).split('/')[0]
          if (segment) result.add(segment)
        }
      }
      for (const dir of dirs) {
        if (dir !== dirPath && dir.startsWith(prefix)) {
          const segment = dir.slice(prefix.length).split('/')[0]
          if (segment) result.add(segment)
        }
      }
      return [...result]
    },

    async mkdir(dirPath) {
      dirs.add(dirPath)
    },

    async rmdir(dirPath) {
      dirs.delete(dirPath)
    },

    async stat(filePath) {
      if (files.has(filePath)) {
        return makeFileStat(files.get(filePath).length)
      }
      if (dirs.has(filePath)) {
        return makeDirStat()
      }
      const prefix = `${filePath}/`
      for (const key of [...files.keys(), ...dirs]) {
        if (key.startsWith(prefix)) {
          return makeDirStat()
        }
      }
      const err = new Error(
        `ENOENT: no such file or directory, stat '${filePath}'`
      )
      err.code = 'ENOENT'
      throw err
    },

    async lstat(filePath) {
      return promises.stat(filePath)
    },

    async readlink() {
      const err = new Error('EINVAL: invalid argument, readlink')
      err.code = 'EINVAL'
      throw err
    },

    async symlink() {},
    async chmod() {},
  }

  return { promises }
}

module.exports = { createMemFS }