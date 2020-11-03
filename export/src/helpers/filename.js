const normalize = (str) => {
  if (typeof str === 'object') {
    str = str.toString()
  }
  return str
    .replace(/\s/g, "_")
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9_]/g, '')

}

module.exports = {
  normalize: normalize
}
