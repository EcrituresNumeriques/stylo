import clsx from 'clsx'
import { useCombobox } from 'downshift'
import { Search } from 'lucide-react'
import { useCallback, useState } from 'react'

import throttle from 'lodash.throttle'

import { searchAuthor as isidoreAuthorSearch } from '../../../helpers/isidore.js'
import { Field } from '../../atoms/index.js'

import fieldStyles from '../../atoms/Field.module.scss'
import styles from '../../molecules/form.module.scss'

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
    forename: firstname,
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
    <div>
      <Field
        {...getInputProps(
          {
            className: styles.autocompleteField,
            autoComplete: 'disabled',
            icon: <Search />,
            readOnly: props.readonly,
          },
          { suppressRefError: true }
        )}
      />
      <ul {...getMenuProps()} className={fieldStyles.comboboxResults}>
        {isOpen &&
          inputItems.map((item, index) => {
            return (
              <li
                className={clsx(
                  fieldStyles.comboboxItem,
                  highlightedIndex === index &&
                    fieldStyles.comboboxHighlightedItem
                )}
                key={`${item.option['@value']}${index}`}
                {...getItemProps({ item, index })}
              >
                {item['@label']}
              </li>
            )
          })}
      </ul>
    </div>
  )
}
