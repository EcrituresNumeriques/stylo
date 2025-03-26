import React, { useEffect, useMemo, useState } from 'react'
import styles from './field.module.scss'
import buttonStyles from './button.module.scss'
import { useCombobox } from 'downshift'
import PropTypes from 'prop-types'
import { ChevronDown, X } from 'lucide-react'

import Field from './Field.jsx'
import clsx from 'clsx'
import { groupItems } from './SelectCombobox.js'

/**
 * @typedef {Object} ComboboxItem
 *
 * @property {String} key
 * @property {String} name
 * @property {Number} index
 * @property {String} [section]
 */

export default function Combobox({
  id,
  label,
  items,
  value: initialSelectedItem,
  onChange,
}) {
  const [inputItems, setInputItems] = useState([])
  const selectedItem = useMemo(
    () => items.find(({ key }) => key === initialSelectedItem),
    [initialSelectedItem]
  )
  const groupedItems = useMemo(() => groupItems(inputItems), [inputItems])

  // Refresh the items list if loading is async
  useEffect(() => setInputItems(items), [items])

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    setInputValue,
    openMenu,
    getItemProps,
    inputValue,
  } = useCombobox({
    items,
    initialSelectedItem: selectedItem,
    itemToString: ({ name }) => name,
    onSelectedItemChange: ({ selectedItem }) => onChange(selectedItem.key),
    onInputValueChange: ({ inputValue }) => {
      setInputItems(
        !inputValue
          ? items
          : items.filter((item) => {
              return item.name.toLowerCase().includes(inputValue.toLowerCase())
            })
      )
    },
  })

  return (
    <div className={styles.combobox}>
      <label {...getLabelProps()}>{label}</label>
      <div {...getComboboxProps()} className={styles.comboboxController}>
        <Field
          {...getInputProps({
            type: 'search',
            autoComplete: 'disabled',
            onFocus: () => !isOpen && openMenu(),
          })}
          className={styles.autocompleteField}
        />
        <span className={styles.comboboxControllerActions}>
          <button
            type="button"
            aria-label="reset value"
            className={clsx(buttonStyles.button, buttonStyles.icon)}
            onClick={() => setInputValue('') || openMenu()}
            disabled={inputValue === ''}
          >
            <X />
          </button>
          <button
            type="button"
            {...getToggleButtonProps()}
            className={buttonStyles.icon}
            aria-label="toggle menu"
          >
            <ChevronDown />
          </button>
        </span>
      </div>
      <ul {...getMenuProps()} className={styles.comboboxResults}>
        {isOpen &&
          groupedItems.map(([section, items]) => (
            <ul
              className={styles.comboboxGroup}
              data-label={section}
              key={section}
            >
              {items.map((item) => (
                <li
                  className={clsx(
                    styles.comboboxItem,
                    highlightedIndex === item.index &&
                      styles.comboboxHighlightedItem
                  )}
                  key={item.key}
                  {...getItemProps({ item, index: item.index })}
                >
                  {item.name}
                </li>
              ))}
            </ul>
          ))}
      </ul>
    </div>
  )
}

Combobox.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
}
