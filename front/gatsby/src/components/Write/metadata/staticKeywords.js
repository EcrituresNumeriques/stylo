import React, {useState} from 'react'
import {useCombobox} from 'downshift'
import keywords from './keywords.json'

const uiSchema = {
  items: {
    'ui:ObjectFieldTemplate': AutocompleteField,
  },
}

function ObjectIsEmpty (object) {
  return typeof object === 'object' && Object.keys(object).length === 0
}

/**
 * Search a keyword from keywords.json
 * @param {string} searchValue
 * @returns {Array<Object>}
 */
function search (searchValue) {
  if (searchValue && searchValue.length > 0) {
    return keywords.filter((keyword) => keyword.label.toLowerCase().includes(searchValue.toLowerCase()))
  }
  return []
}

function AutocompleteField (props) {
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

        props.formContext.partialUpdate({ id, value: selectedItem })
      }
    },
    onInputValueChange: ({ inputValue }) => {
      const replies = search(inputValue)
      setInputItems(replies)
    },
  })

  const isEmpty = ObjectIsEmpty(props.formData)

  return <div {...getComboboxProps()}>
    {!isEmpty && <span>{props.formData.label}</span>}
    <input {...getInputProps(!isEmpty ? { hidden: true } : {})} />
    <ul {...getMenuProps()}>
      {isOpen &&
      inputItems.map((item, index) => (
        <li
          style={
            highlightedIndex === index ? { backgroundColor: '#bde4ff' } : {}
          }
          key={`${item.label}${index}`}
          {...getItemProps({ item, index })}
        >
          {item.label}
        </li>
      ))}
    </ul>
  </div>
}

export default {
  uiSchema: uiSchema,
}
