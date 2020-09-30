import React, { useState } from 'react'
import Form from '@rjsf/core'
import { categories } from './Write/yamleditor/default/categories.js'
import { set } from 'object-path-immutable'

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
      type: 'string',
      title: 'Citation Link',
      enum: ['true', 'false'],
    },
    nocite: {
      type: 'string',
      title: 'Display',
      enum: ['@*', ''],
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
      'ui:examples': categories,
      'ui:examples-key-value': ({ uriRameau:key, label:value }) => ({ key, value }),
      'ui:examples-find': (value) => (el) => el.uriRameau === value,
      'ui:ObjectFieldTemplate': (props) => {
        const hasData = Object.keys(props.formData).length !== 0
        const autocompleteData = props.uiSchema['ui:examples']
        const mapFn = props.uiSchema['ui:examples-key-value']
        const findFn = props.uiSchema['ui:examples-find']
        const options = autocompleteData.map(mapFn)
        return (
          <>
          {hasData && <span>{props.formData.label}</span>}
          {!hasData && <><input
            type="text"
            id={props.id}
            list={`${props.id}-list`}
            className="field-autocomplete"
            value={props.value}
            required={props.required}
            onChange={({ target }) => {
              const {value} = target

              if (!value) {
                return
              }

              const category = autocompleteData.find(findFn(value))
              if (category) {
                const path = props.idSchema.$id.replace('root_', '').replace('_', '.')
                props.formContext.partialUpdate({ path, value: category })
                target.value = ''
              }
            }}
          />
          <datalist id={`${props.id}-list`}>
            {options.map(({ key, value }) => <option key={key} value={key}>{value}</option>)}
          </datalist>
          </>}
          </>
        );
      },
    },
  }
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

export default (props) => {
  const [formData, setFormData] = useState({})
  const formContext = {
    partialUpdate: ({ path, value}) => {
      setFormData(state => set(state, path, value))
    }
  }

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
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </output>
    </>
  )
}
