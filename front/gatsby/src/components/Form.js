import React, { useState } from 'react'
import Form from '@rjsf/core'
import { set } from 'object-path-immutable'
import uiSchema from '../schemas/ui-schema.json'
import schema from '../schemas/data-schema.json'
import {toYaml} from './Write/metadata/yaml.js'

import styles from './form.module.scss'


function ArrayFieldTemplate(props) {

  const addItemTitle = props.uiSchema['ui:add-item-title'] || 'Add'
  const removeItemTitle = props.uiSchema['ui:remove-item-title'] || 'Remove'
  const title = props.uiSchema['ui:title']

  return (
    <fieldset className={props.className} key={props.key}>
      {title && <legend id={props.id}>{title}</legend>}
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

function ObjectFieldTemplate(props) {
  if (props.uiSchema['ui:groups']) {
    const groups = props.uiSchema['ui:groups']
    const groupedElements = groups.map(({fields, title}) => {
      const elements = props.properties.filter((element) => fields.includes(element.name))
      return (
        <fieldset className="fieldgroup" key={fields.join('-')}>
          {title && <legend>{title}</legend>}
          {elements.map(element =><div className="property-wrapper" key={element.name}>{element.content}</div>)}
        </fieldset>
      )
    })
    
    return (
      <>{groupedElements}</>
    )
  }
  
  return (
    <div key={props.key}>
      {props.title}
      {props.description}
      {props.properties.map(element => <div className="property-wrapper" key={element.name}>{element.content}</div>)}
    </div>
  );
}


export default ({ formData: initialFormData }) => {
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const formContext = {
    partialUpdate: ({ id, value }) => {
      const path = id.replace('root_', '').replace('_', '.')
      setFormData(state => set(state, path, value))
    }
  }

  const yamlOutput = toYaml(formData)

  return (
    <Form
      className={styles.form}
      ObjectFieldTemplate={ObjectFieldTemplate}
      ArrayFieldTemplate={ArrayFieldTemplate}
      formContext={formContext}
      schema={schema}
      uiSchema={uiSchema}
      formData={formData}
      onChange={(e) => setFormData(e.formData)}
      onError={setErrors}
    ><hr hidden={true} /></Form>
  )
}
