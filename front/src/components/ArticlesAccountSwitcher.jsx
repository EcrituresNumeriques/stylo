import React, { useState } from 'react'
import { useCombobox } from 'downshift'
import { ChevronDown, XCircle, Search } from 'react-feather'
import Field from './Field'
import styles from './articles.module.scss'

export default function ArticlesAccountSwitcher ({ accounts, onChange }) {
  const [inputItems, setInputItems] = useState(accounts)
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
  } = useCombobox({
    items: inputItems,
    initialSelectedItem: accounts[0],
    itemToString: (user => user.displayName),
    onSelectedItemChange: onChange,
    onInputValueChange: ({ inputValue }) => {
      setInputItems(
        accounts.filter((user) =>
        user.displayName.toLowerCase().startsWith(inputValue.toLowerCase()),
        ),
      )
    },
  })

  return (
    <div className={styles.filtersOwnersSelector}>
      <label {...getLabelProps()}>Viewing articles as</label>
      <div {...getComboboxProps({ className: styles.filtersOwnersCombobox})}>
        <Field {...getInputProps({ className: styles.autocompleteField, type: 'search', autoComplete: "disabled", icon: Search}, { suppressRefError: true })}/>
        <span className={styles.filtersOwnersButtons}>
          <button
            type="button"
            aria-label="reset value"
            className={styles.filtersOwnersButton}
            onClick={() => setInputValue('') || openMenu()}
          >
            <XCircle />
          </button>
          <button
            type="button"
            {...getToggleButtonProps({ className: styles.filtersOwnersButton })}
            aria-label="toggle menu"
          >
            <ChevronDown />
          </button>
        </span>
      </div>
      <ul {...getMenuProps({ className: styles.filtersOwnersMenu })}>
        {isOpen &&
          inputItems.map((user, index) => (
            <li
              style={
                highlightedIndex === index ? {backgroundColor: '#bde4ff'} : {}
              }
              key={`${user._id}${index}`}
              {...getItemProps({item: user, index})}
            >
              {user.displayName}
            </li>
          ))}
      </ul>
    </div>
  )
}
