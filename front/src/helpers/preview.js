const DEFAULT_TEMPLATE = '$body$'

export function compileTemplate(safeHtmlTemplate) {
  const template = safeHtmlTemplate || DEFAULT_TEMPLATE
  const placeholders = Array.from(template.matchAll(/\$([^$\s\W]+)\$/g))

  return function render(data = {}) {
    return placeholders.reduce((pandocHtml, [pattern, key]) => {
      return pandocHtml.replace(
        pattern,
        Object.hasOwn(data, key) ? data[key] : ''
      )
    }, template)
  }
}
