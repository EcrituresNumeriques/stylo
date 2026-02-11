import clsx from 'clsx'
import { useCombobox } from 'downshift'
import { ChevronDown, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Field } from '../atoms/index.js'
import { groupItems } from './SelectCombobox.js'
import { Loading } from './index.js'

import buttonStyles from '../atoms/Button.module.scss'
import styles from '../atoms/Field.module.scss'

/**
 * @typedef {object} ComboboxItem
 * @property {string} key
 * @property {string} name
 * @property {number} index
 * @property {string} [section]
 */

/**
 * @param {React.PropsWithChildren} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {ComboboxItem[]} props.items
 * @param {boolean} [props.isLoading]
 * @param {(string) => void} props.onChange
 * @param {string} props.value
 * @param {string} [props.className]
 * @returns {React.ReactElement}
 */
export default function Combobox({
  id,
  label,
  items,
  value: selectedItem,
  isLoading = false,
  className,
  onChange,
}) {
  const [inputItems, setInputItems] = useState(items)
  const groupedItems = useMemo(() => groupItems(inputItems), [inputItems])

  useEffect(() => {
    setInputItems(items)

    if (selectedItem) {
      const item = items.find(({ key }) => key === selectedItem)
      setInputValue(item?.name)
      setHighlightedIndex(items.findIndex(({ key }) => key === selectedItem))
    }
  }, [items])

  const stateReducer = useCallback(
    function reducer(state, { changes, type }) {
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          onChange(changes.selectedItem.key)

          return {
            ...changes,
            highlightedIndex: items.findIndex(
              ({ key }) => key === changes.selectedItem.key
            ),
          }

        case useCombobox.stateChangeTypes.InputChange:
        case useCombobox.stateChangeTypes.FunctionReset:
          if (
            type === useCombobox.stateChangeTypes.FunctionReset ||
            changes.inputValue === ''
          ) {
            onChange('')
          }

          setInputItems(
            !changes.inputValue
              ? items
              : items.filter((item) => {
                  return item.name
                    .toLowerCase()
                    .includes(changes.inputValue.toLowerCase())
                })
          )

          return changes

        default:
          return changes
      }
    },
    [items]
  )

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    openMenu,
    getItemProps,
    inputValue,
    setInputValue,
    setHighlightedIndex,
    reset,
  } = useCombobox({
    items,
    selectedItem,
    stateReducer,
    itemToString(item) {
      return item?.name
    },
    itemToKey(item) {
      return item?.key
    },
  })

  const handleOnFocus = useCallback(
    () => !isOpen && openMenu(),
    [isOpen, openMenu]
  )

  return (
    <div className={clsx(styles.combobox, className && className)}>
      <label {...getLabelProps()}>{label}</label>
      <div className={styles.comboboxController}>
        <Field
          {...getInputProps({
            type: 'search',
            autoComplete: 'disabled',
            onFocus: handleOnFocus,
          })}
          isLoading={isLoading}
          icon={isLoading && <Loading />}
          onClick={handleOnFocus}
          name={id}
          className={styles.autocompleteField}
        />
        <span className={styles.comboboxControllerActions}>
          <button
            type="button"
            aria-label="reset value"
            className={clsx(buttonStyles.button, buttonStyles.icon)}
            disabled={inputValue === ''}
            onClick={reset}
          >
            <X aria-hidden="true" />
          </button>
          <button
            type="button"
            {...getToggleButtonProps()}
            className={buttonStyles.icon}
            aria-label="toggle menu"
          >
            <ChevronDown aria-hidden="true" />
          </button>
        </span>
      </div>
      <ul {...getMenuProps()} className={styles.comboboxResults}>
        {isOpen &&
          groupedItems.map(([section, items]) => (
            <ul
              className={styles.comboboxGroup}
              data-label={section}
              key={section || 'main'}
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
