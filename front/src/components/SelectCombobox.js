/**
 * @typedef {import('./SelectCombobox.jsx').ComboboxItem} ComboboxItem
 */

/**
 * @param {ComboboxItem[]} items
 */
export function groupItems (items) {
  return Array.from(items.reduce((groups, item, index) => {
    if (!groups.has(item.section)) {
      groups.set(item.section, [])
    }

    groups.get(item.section).push({ ...item, index })

    return groups
  }, new Map()).entries())
}
