function computeMajorVersion(versionObject = { version: 0, revision: 0 }) {
  const { version } = versionObject

  return { revision: 0, version: version + 1 }
}

function computeMinorVersion(versionObject = { version: 0, revision: 0 }) {
  const { revision, version } = versionObject

  return { revision: revision + 1, version }
}

module.exports = {
  computeMajorVersion,
  computeMinorVersion,
}
