import React, { useState, forwardRef } from 'react'
import { useCombobox } from 'downshift'
import { ChevronDown, X, Search } from 'react-feather'
import Field from './Field'
import styles from './articles.module.scss'

const ArticlesAccountSwitcher = forwardRef(({ accounts, onChange, selectedItem }, forwardedRef) => {
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
    inputValue,
  } = useCombobox({
    items: inputItems,
    selectedItem,
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
        <Field {...getInputProps({ className: styles.autocompleteField, ref: forwardedRef, type: 'search', autoComplete: "disabled", icon: Search})}/>
        <span className={styles.filtersOwnersButtons}>
          <button
            type="button"
            aria-label="reset value"
            className={styles.filtersOwnersButton}
            onClick={() => setInputValue('') || openMenu()}
            disabled={inputValue === ''}
          >
            <X />
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
})

ArticlesAccountSwitcher.displayName = 'ArticlesAccountSwitcher'

export default ArticlesAccountSwitcher
