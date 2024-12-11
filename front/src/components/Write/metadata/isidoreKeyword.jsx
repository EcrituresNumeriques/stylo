import React, { useCallback, useState } from 'react'
import throttle from 'lodash.throttle'
import { searchKeyword as isidoreKeywordSearch } from '../../../helpers/isidore'
import { useCombobox } from 'downshift'
import Field from '../../Field'

import styles from '../../form.module.scss'

const toValueFn = (el) => ({
  label: el['@label'],
  // when 'feed' is provided, 'option' is returned as an object
  // when there are several values, 'option' is returned as an array of objects
  uriRameau: Array.isArray(el.option)
    ? el.option.find((meta) => meta['@key'] === 'uri')['@value']
    : el.option['@value'],
  idRameau: '',
})

function ObjectIsEmpty(object) {
  return typeof object === 'object' && Object.keys(object).length === 0
}

export default function IsidoreAPIAutocompleteField(props) {
  const [inputItems, setInputItems] = useState([])
  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items: inputItems,
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        const { $id: id } = props.idSchema
        props.formContext.partialUpdate({ id, value: toValueFn(selectedItem) })
      }
    },
    onInputValueChange: ({ inputValue }) => delayedSearch(inputValue),
  })

  const delayedSearch = useCallback(
    throttle(
      async (value) => {
        const replies = await isidoreKeywordSearch(value)
        setInputItems(replies)
      },
      200,
      { trailing: true, leading: true }
    ),
    []
  )

  const isEmpty = ObjectIsEmpty(props.formData)

  return (
    <div {...getComboboxProps()}>
      {!isEmpty && (
        <span className={styles.comboboxReadonlyField}>
          {props.formData.label}
        </span>
      )}
      {isEmpty && (
        <Field
          {...getInputProps(
            { className: styles.autocompleteField },
            { suppressRefError: true }
          )}
        />
      )}
      <ul {...getMenuProps()}>
        {isOpen &&
          inputItems.map((item, index) => (
            <li
              style={
                highlightedIndex === index ? { backgroundColor: '#bde4ff' } : {}
              }
              key={`${item.option['@value']}${index}`}
              {...getItemProps({ item, index })}
            >
              {item['@label']}
            </li>
          ))}
      </ul>
    </div>
  )
}
