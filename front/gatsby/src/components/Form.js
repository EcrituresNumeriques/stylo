import React, { useCallback, useState } from 'react'
import {throttle} from "lodash"
import Form from '@rjsf/core'
import { search as isidoreSearch } from '../helpers/isidore'
import { set } from 'object-path-immutable'
import yaml from 'js-yaml'
import {useCombobox} from 'downshift'

import styles from './form.module.scss'

const schema = {
  title: 'Metadata',
  type: 'object',
  required: ['title'],
  definitions: {
    lang: {
      type: 'string',
      enum: ['fr', 'en', 'it', 'es', 'pt', 'de', 'uk', 'ar'],
    },
    person: {
      type: 'object',
      properties: {
        firstname: {
          type: 'string',
          title: 'First name',
        },
        lastname: {
          type: 'string',
          title: 'Last name',
        },
        orcid: {
          type: 'string',
          title: 'ORCID',
        },
        viaf: {
          type: 'string',
          title: 'VIAF',
        },
        foaf: {
          type: 'string',
          title: 'FOAF',
        },
        isni: {
          type: 'string',
          title: 'ISNI',
        },
        wikidata: {
          type: 'string',
          title: 'Wikidata',
        },
      },
    },
  },
  properties: {
    id: { type: 'string' },
    url_article: { type: 'string' },
    title: { type: 'string' },
    subtitle: { type: 'string' },
    date: { type: 'string' },
    lang: { $ref: '#/definitions/lang' },
    license: { type: 'string' },
    'link-citations': {
      type: 'boolean',
      title: 'Citation Link',
      enumNames: ['yes', 'no'],
    },
    nocite: {
      type: 'string',
      title: 'Display',
      enum: ['@*', ''],
      enumNames: ['All citations', 'Only used']
    },
    authors: {
      type: 'array',
      title: 'Authors',
      items: { $ref: '#/definitions/person' },
    },
    abstract: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          lang: { $ref: '#/definitions/lang' },
          text: { type: 'string' },
        },
      },
    },
    keywords: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          lang: { $ref: '#/definitions/lang' },
          list: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    },
    referencedKeywords: {
      type: 'array',
      title: 'Mots clés contrôlés',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          idRameau: { type: 'string' },
          uriRameau: { type: 'string' }
        }
      },
      uniqueItems: true,
    },
    typeArticle: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'Essai',
          'Création',
          'Lecture',
          'Sommaire dossier',
          'Entretien',
          'Chronique',
        ],
      },
      uniqueItems: true,
    },
    publisher: { type: 'string' },
    journal: { type: 'string' },
    dossier: {
      type: 'array',
      minItems: 1,
      maxItems: 1,
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          id: { type: 'string' }
        }
      },
    },
    translationOf: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          url: { type: 'string' },
          lang: { $ref: '#/definitions/lang' },
        }
      }
    },
    reviewers: {
      type: 'array',
      items: { $ref: '#/definitions/person' },
    },
    issueDirectors: {
      type: 'array',
      items: { $ref: '#/definitions/person' },
    },
    translators: {
      type: 'array',
      items: { $ref: '#/definitions/person' },
    },
    transcribers: {
      type: 'array',
      items: { $ref: '#/definitions/person' },
    },
    directors: {
      type: 'array',
      items: { $ref: '#/definitions/person' },
    },
  },
}

const uiSchema = {
  id: {
    'ui:title': 'ID',
    'ui:placeholder': 'XXXX',
  },
  url_article: {
    'ui:title': 'URL of the article',
    'ui:placeholder': 'URL of the article',
    'ui:widget': 'uri',
  },
  title: {
    'ui:title': 'Title',
  },
  subtitle: {
    'ui:title': 'Subtitle',
  },
  'link-citations': {
    'ui:widget': 'select'
  },
  date: {
    'ui:title': 'Date',
    'ui:widget': 'date',
  },
  lang: {
    'ui:title': 'Lang',
    'ui:placeholder': 'Choose lang of text',
  },
  license: {
    'ui:title': 'License',
    'ui:placeholder': 'License',
  },
  authors: {
    'add-item-title': 'Ajouter un auteur',
  },
  translationOf: {
    items: {
      url: {
        'ui:widget': 'uri'
      }
    }
  },
  abstract: {
    'add-item-title': 'Ajouter un résumé',
    items: {
      lang: {
        'ui:title': 'Lang',
        'ui:placeholder': 'Choose lang of summary',
      },
      text: {
        'ui:title': 'Résumé',
        'ui:widget': 'textarea',
      },
    },
  },
  typeArticle: {
    'ui:widget': 'checkboxes',
  },
  referencedKeywords: {
    items: {
      'ui:to-value-fn': (el) => ({
        label: el['@label'],
        uriRameau: el.option['@value'],
        idRameau: ''
      }),
      'ui:ObjectFieldTemplate': AutocompleteField,
    },
  },
  dossier: {
    "ui:options": {
      removable: false,
      addable: false
    }
  }
}

function AutocompleteField (props) {
  const [inputItems, setInputItems] = useState([])
  const {
    isOpen,
    //getToggleButtonProps,
    //getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items: inputItems,
    onSelectedItemChange: ({selectedItem}) => {
      if (selectedItem) {
        const {$id: id} = props.idSchema
        
        props.formContext.partialUpdate({ id, value: toValueFn(selectedItem) })
      }
    },
    onInputValueChange: ({inputValue}) => delayedSearch(inputValue),
  })

  const delayedSearch = useCallback(throttle(async (value) => {
      const replies = await isidoreSearch(value)
      setInputItems(replies)
    }, 200, { trailing: true, leading: true }
  ), [])

  const isEmpty = ObjectIsEmpty(props.formData)
  const toValueFn = props.uiSchema['ui:to-value-fn'] ?? ((el) => el)

  return <div {...getComboboxProps()}>
     {!isEmpty && <span>{props.formData.label}</span>}
     <input {...getInputProps(!isEmpty ? { hidden: true } : {})} />
     <ul {...getMenuProps()}>
        {isOpen &&
          inputItems.map((item, index) => (
            <li
              style={
                highlightedIndex === index ? {backgroundColor: '#bde4ff'} : {}
              }
              key={`${item.option['@value']}${index}`}
              {...getItemProps({item, index})}
            >
              {item['@label']}
            </li>
          ))}
      </ul>
    </div>
}

function ArrayFieldTemplate(props) {

  const addItemTitle = props.uiSchema['add-item-title'] || 'Ajouter'
  return (
    <div className={props.className} key={props.key}>
      <legend id={props.id}>{props.title}</legend>
      {props.items &&
        props.items.map((element) => (
          <div id={element.key} key={element.key} className={element.className}>
            {element.children}
            {element.hasRemove && (
              <button
                type="button"
                className={styles.removeButton}
                tabIndex={-1}
                disabled={element.disabled || element.readonly}
                onClick={element.onDropIndexClick(element.index)}
              >
                Supprimer
              </button>
            )}
          </div>
        ))}
      {props.canAdd && (
        <button
          type="button"
          className={styles.addButton}
          tabIndex={-1}
          onClick={props.onAddClick}
        >
          {addItemTitle}
        </button>
      )}
    </div>
  )
}

export function cleanOutput (object){
  let cleaning = JSON.parse(JSON.stringify(object))

  if (ObjectIsEmpty(cleaning)) {
    return ''
  }

  for (var propName in cleaning) { 
    if (cleaning[propName] === null || cleaning[propName] === undefined || cleaning[propName] === "") {
      delete cleaning[propName];
    }
    if(Array.isArray(cleaning[propName]) && cleaning[propName].length === 0){
      delete cleaning[propName];
    }
    if(ObjectIsEmpty(cleaning[propName])) {
      delete cleaning[propName];
    }
  }
  return cleaning
}

export function ObjectIsEmpty (object) {
  return typeof object === 'object' && Object.keys(object).length === 0
}

export default (props) => {
  const [formData, setFormData] = useState({})
  const formContext = {
    partialUpdate: ({ id, value }) => {
      const path = id.replace('root_', '').replace('_', '.')
      setFormData(state => set(state, path, value))
    }
  }

  const yamlOutput = '---\n' + yaml.safeDump(cleanOutput(formData)) + '---'

  return (
    <>
      <Form
        className={styles.form}
        ArrayFieldTemplate={ArrayFieldTemplate}
        formContext={formContext}
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onChange={(e) => setFormData(e.formData)}
        onSubmit={(e) => console.log('submitted', e)}
        onError={(e) => console.log('errors', e)}
      />
      <output className={styles.output}>
        <pre>{yamlOutput}</pre>
      </output>
    </>
  )
}
