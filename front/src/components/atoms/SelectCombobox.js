/**
 * @typedef {import('./SelectCombobox.jsx').ComboboxItem} ComboboxItem
 */

/**
 * @param {ComboboxItem[]} items
 * @returns {Record<string, ComboboxItem[]>}
 */
export function groupItems(items) {
  return Array.from(
    items
      .reduce((groups, item) => {
        const section = item.section
        if (!groups.has(section)) {
          groups.set(section, [])
        }
        groups.get(section).push({ ...item })
        return groups
      }, new Map())
      .entries()
  )
}
