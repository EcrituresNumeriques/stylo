import React, {Fragment, useMemo, useState} from 'react'
import Form from '@rjsf/core'
import {set} from 'object-path-immutable'
import basicUiSchema from '../schemas/ui-schema-basic-override.json'
import uiSchema from '../schemas/ui-schema-editor.json'
import staticKeywordsComponent from './Write/metadata/staticKeywords.js'
import schema from '../schemas/data-schema.json'
import {toYaml} from './Write/metadata/yaml.js'

import styles from './form.module.scss'


function ArrayFieldTemplate (props) {

  const addItemTitle = props.uiSchema['ui:add-item-title'] || 'Ajouter'
  const removeItemTitle = props.uiSchema['ui:remove-item-title'] || 'Supprimer'
  const title = props.uiSchema['ui:title']

  return (
    <fieldset className={styles.fieldsetGroup} key={props.key}>
      {title && <legend id={props.id}>{title}</legend>}
      {props.items &&
      props.items.map((element) => (
        <div id={element.key} key={element.key} className={`${element.className} can-add-remove`}>
          {element.children}
          {element.hasRemove && (
            <button
              type="button"
              className={styles.removeButton}
              tabIndex={-1}
              disabled={element.disabled || element.readonly}
              onClick={element.onDropIndexClick(element.index)}
            >
              {removeItemTitle}
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
    </fieldset>
  )
}

function ObjectFieldTemplate (props) {
  if (props.uiSchema['ui:groups']) {
    const groups = props.uiSchema['ui:groups']
    const groupedElements = groups.map(({ fields, title }) => {
      const elements = fields
        .filter((field) => (props.uiSchema[field] || {})['ui:widget'] !== 'hidden')
        .map((field) => props.properties.filter((element) => element.name === field)[0])
      if (elements && elements.length > 0) {
        return (
          <fieldset className={styles.fieldset} key={fields.join('-')}>
            {title && <legend>{title}</legend>}
            {elements.map(element => <Fragment key={element.name}>{element.content}</Fragment>)}
          </fieldset>
        )
      }
    })

    return (
      <>{groupedElements}</>
    )
  }

  if (props) {
    return (
      <Fragment key={props.key}>
        {props.title}
        {props.description}
        {props.properties.map(element => <Fragment key={element.name}>{element.content}</Fragment>)}
      </Fragment>
    );
  }
}


export default ({ formData: initialFormData, basicMode, onChange = () => {} }) => {
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const formContext = {
    partialUpdate: ({ id, value }) => {
      const path = id.replace('root_', '').replace('_', '.')
      setFormData(state => {
        const newFormData = set(state, path, value)
        onChange(toYaml(newFormData))
        return newFormData
      })
    }
  }

  const effectiveUiSchema = useMemo(() => (basicMode ? { ...uiSchema, ...basicUiSchema } : uiSchema), [basicMode])
  // use static keywords component
  effectiveUiSchema.referencedKeywords = { ...effectiveUiSchema.referencedKeywords, ...staticKeywordsComponent.uiSchema }

  return (
    <Form
      className={styles.form}
      ObjectFieldTemplate={ObjectFieldTemplate}
      ArrayFieldTemplate={ArrayFieldTemplate}
      formContext={formContext}
      schema={schema}
      uiSchema={effectiveUiSchema}
      formData={formData}
      onChange={(e) => {
        setFormData(e.formData);
        onChange(toYaml(e.formData));
      }}
      onError={setErrors}
    >
      <hr hidden={true}/>
    </Form>
  )
}
