/**
 * Generates pandoc markdown-compliant inline code attributes
 * @see https://pandoc.org/MANUAL.html#extension-inline_code_attributes
 * @param {object} [attributes]
 * @param {Array.<string>} attributes.classNames
 * @param {{[key: string]: string}?} attributes.attrs key/value attributes
 * @returns {string|undefined}
 */
export function blockAttributes({ classNames = [], attrs = {} } = {}) {
  if (attrs === null || attrs === undefined) {
    return ''
  }

  const id = Object.hasOwn(attrs, 'id') ? attrs.id : null

  const parts = [
    id ? `#${id}` : null,
    classNames
      .filter((d) => d)
      .flatMap((c) => c.split(','))
      .map((c) => `.${c.trim()}`),
    Object.entries(attrs)
      .filter(([key]) => key !== 'id')
      .map(
        ([key, value]) =>
          `${key}="${typeof value === 'function' ? value(key) : value}"`
      ),
  ]
    .flat()
    .filter((d) => d)

  return parts.length ? `{${parts.join(' ')}}` : ''
}
