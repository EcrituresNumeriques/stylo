import React, { useCallback, useState } from 'react'
import throttle from 'lodash/throttle'
import { search as isidoreSearch } from '../../../helpers/isidore'
import { useCombobox } from 'downshift'

const uiSchema = {
  items: {
    'ui:to-value-fn': (el) => ({
      label: el['@label'],
      uriRameau: el.option['@value'],
      idRameau: '',
    }),
    'ui:ObjectFieldTemplate': AutocompleteField,
  },
}

function ObjectIsEmpty(object) {
  return typeof object === 'object' && Object.keys(object).length === 0
}

function AutocompleteField(props) {
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
        const replies = await isidoreSearch(value)
        setInputItems(replies)
      },
      200,
      { trailing: true, leading: true }
    ),
    []
  )

  const isEmpty = ObjectIsEmpty(props.formData)
  const toValueFn = props.uiSchema['ui:to-value-fn'] ?? ((el) => el)

  return (
    <div {...getComboboxProps()}>
      {!isEmpty && <span>{props.formData.label}</span>}
      <input {...getInputProps(!isEmpty ? { hidden: true } : {})} />
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

export default {
  uiSchema: uiSchema,
}
