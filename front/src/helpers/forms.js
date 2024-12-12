/**
 * Transforms a form into a plain object
 *
 * formData.entries() does not handle multiple values (sic) and formData.getAll() only works at a field level
 *
 * @param {React.ReactHTMLElement|FormData} formElement
 * @returns {Record<string, string|number|string[]|number[]>}
 */
export function fromFormData(input) {
  const d = input instanceof FormData ? input : new FormData(input)

  return Array.from(d.keys()).reduce(
    (data, key) => ({
      ...data,
      [key.replace('[]', '')]: key.endsWith('[]') ? d.getAll(key) : d.get(key),
    }),
    {}
  )
}
