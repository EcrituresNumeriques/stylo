const SLUG_SEPARATOR = '-'

function slugify (string, { separator }) {
  return string
    .replace(/#/g, '')
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, separator)

}

export function usePandocAnchoring (separator = SLUG_SEPARATOR) {
  const state = new Map()

  return function getAnchor (string) {
    let slug = slugify(string, { separator: SLUG_SEPARATOR })

    if (state.has(slug)) {
      const index = state.get(slug)
      state.set(slug, index + 1)

      // we also keep track of this repeated heading
      // We then avoid 'Part 1' to collide with 'Part' then 'Part'
      slug = `${slug}${separator}${index}`
      state.set(slug, 1)
    }
    else {
      state.set(slug, 1)
    }

    return slug
  }
}
