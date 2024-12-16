import slugify from 'slugify'

export function usePandocAnchoring() {
  const state = new Map()

  return function getAnchor(string) {
    let slug = slugify(string, { strict: true, lower: true })

    if (state.has(slug)) {
      const index = state.get(slug)
      state.set(slug, index + 1)

      // we also keep track of this repeated heading
      // We then avoid 'Part 1' to collide with 'Part' then 'Part'
      slug = `${slug}-${index}`
      state.set(slug, 1)
    } else {
      state.set(slug, 1)
    }

    return slug
  }
}
