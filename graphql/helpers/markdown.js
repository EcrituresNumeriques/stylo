function deriveToc(md) {
  return md
    .split('\n')
    .filter((line) => line.match(/^#+ /))
    .join('\n')
}

module.exports = {
  deriveToc,
}
