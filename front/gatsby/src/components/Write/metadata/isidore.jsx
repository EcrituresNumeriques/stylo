import React, { useCallback, useState } from 'react'
import { throttle } from 'lodash'
import { search as isidoreSearch } from '../../../helpers/isidore'
import { useCombobox } from 'downshift'
import Field from '../../Field'

import styles from '../../form.module.scss'

const toValueFn = (el) => ({
  label: el['@label'],
  uriRameau: el.option.find(meta => meta['@key'] === 'uri')['@value'],
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
        console.log(selectedItem, toValueFn(selectedItem))
        props.formContext.partialUpdate({ id, value: toValueFn(selectedItem) })
      }
    },
    onInputValueChange: ({ inputValue }) => delayedSearch(inputValue),
  })

  const delayedSearch = useCallback(
    throttle(
      async (value) => {
        const replies = await isidoreSearch(value)
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
      {!isEmpty && <span className={styles.comboboxReadonlyField}>{props.formData.label}</span>}
      {isEmpty && <Field {...getInputProps({ className: styles.autocompleteField})} />}
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

