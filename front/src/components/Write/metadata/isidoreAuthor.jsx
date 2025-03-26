import React, { useCallback, useState } from 'react'
import throttle from 'lodash.throttle'
import { searchAuthor as isidoreAuthorSearch } from '../../../helpers/isidore'
import { useCombobox } from 'downshift'
import Field from '../../Field'

import styles from '../../form.module.scss'
import { Search } from 'lucide-react'

function toValueFn(el) {
  const firstname = el.option.find((opt) => opt['@key'] === 'firstname')?.[
    '@value'
  ]
  const lastname = el.option.find((opt) => opt['@key'] === 'lastname')?.[
    '@value'
  ]
  const orcid = el.option.find((opt) => opt['@key'] === 'orcid')?.['@value']
  const isni = el.option.find((opt) => opt['@key'] === 'isni')?.['@value']
  return {
    forname: firstname,
    surname: lastname,
    orcid,
    isni,
  }
}

export default function IsidoreAuthorAPIAutocompleteField(props) {
  const [inputItems, setInputItems] = useState([])
  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
    reset,
  } = useCombobox({
    items: inputItems,
    itemToString: () => '',
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        const { $id: id } = props.idSchema
        props.formContext.partialUpdate({ id, value: toValueFn(selectedItem) })
        reset()
      }
    },
    onInputValueChange: ({ inputValue }) => delayedSearch(inputValue),
  })

  const delayedSearch = useCallback(
    throttle(
      async (value) => {
        const replies = await isidoreAuthorSearch(value)
        setInputItems(replies)
      },
      200,
      { trailing: true, leading: true }
    ),
    []
  )

  return (
    <div {...getComboboxProps()}>
      <Field
        {...getInputProps(
          {
            className: styles.autocompleteField,
            autoComplete: 'disabled',
            icon: Search,
            readOnly: props.readonly,
          },
          { suppressRefError: true }
        )}
      />
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
