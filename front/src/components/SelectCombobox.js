/**
 * @typedef {import('./SelectCombobox.jsx').ComboboxItem} ComboboxItem
 */

/**
 * @param {ComboboxItem[]} items
 * @returns {Record<String, ComboboxItem[]>}
 */
export function groupItems (items) {
  return Array.from(items.reduce((groups, item) => {
    if (!groups.has(item.section)) {
      groups.set(item.section, [])
    }

    groups.get(item.section).push({ ...item })

    return groups
  }, new Map()).entries())
}
