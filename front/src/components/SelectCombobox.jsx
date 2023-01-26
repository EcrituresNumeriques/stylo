import React, { useState } from 'react'
import styles from './field.module.scss'
import buttonStyles from './button.module.scss'
import { useCombobox } from 'downshift'
import PropTypes from 'prop-types'
import { ChevronDown, X } from 'react-feather'


import Field from './Field.jsx'
import clsx from 'clsx'

export default function Combobox ({ id, label, items, value: initialSelectedItem, onChange }) {
  const [inputItems, setInputItems] = useState(items)
  const selectedItem = items.find(({ key }) => key === initialSelectedItem)

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
    items: inputItems,
    initialSelectedItem: selectedItem,
    itemToString: ({ name }) => name,
    onSelectedItemChange: ({ selectedItem }) => onChange(selectedItem.key),
    onInputValueChange: ({inputValue}) => {
      setInputItems(
        !inputValue
          ? items
          : items.filter(item => {
              return item.name.toLowerCase().includes(inputValue.toLowerCase())
            }),
        )
    },
  })

  console.log({ inputValue })

  return (
    <div className={styles.combobox}>
      <label {...getLabelProps()}>{label}</label>
      <div {...getComboboxProps()} className={styles.comboboxController}>
        <Field {...getInputProps({ type: 'search', autoComplete: "disabled", onFocus: () => !isOpen && openMenu() })} className={styles.autocompleteField} />
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
          inputItems.map((item, index) => (
            <li className={clsx(styles.comboboxItem, highlightedIndex === index && styles.comboboxHighlightedItem)}
              key={item.key}
              {...getItemProps({item, index})}
            >
              {item.name}
            </li>
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
  value: PropTypes.string
}
