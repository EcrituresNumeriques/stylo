const prepare = (yaml, id) => {
  // remove lines that contain "bibliography"
  yaml = yaml.replace(/\n.*bibliography.*/gm, '')
  // remove the end YAML delimiter (i.e. "---")
  yaml = yaml.replace(/\n---\n*$/, '')
  // add bibliography link
  yaml = yaml.concat(`
bibliography: ${id}.bib
---`)
  return yaml
}

module.exports = {
  prepare: prepare
}
