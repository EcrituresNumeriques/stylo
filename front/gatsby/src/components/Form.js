import React, {Fragment, useMemo, useState} from 'react'
import Form from '@rjsf/core'
import {set} from 'object-path-immutable'
import basicUiSchema from '../schemas/ui-schema-basic-override.json'
import uiSchema from '../schemas/ui-schema-editor.json'
import schema from '../schemas/data-schema.json'
import {toYaml} from './Write/metadata/yaml.js'

import styles from './form.module.scss'


function ArrayFieldTemplate (props) {

  const addItemTitle = props.uiSchema['ui:add-item-title'] || 'Add'
  const removeItemTitle = props.uiSchema['ui:remove-item-title'] || 'Remove'
  const title = props.uiSchema['ui:title']

  return (
    <fieldset className={styles.fieldsetGroup} key={props.key}>
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

function ObjectFieldTemplate (props) {
  if (props.uiSchema['ui:groups']) {
    const groups = props.uiSchema['ui:groups']

    const groupedElements = groups.map(({ fields, title }) => {
      const elements = props.properties.filter((element) => fields
        .filter((field) => (props.uiSchema[field] || {})['ui:widget'] !== 'hidden')
        .includes(element.name)
      )
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
      <div key={props.key}>
        {props.title}
        {props.description}
        {props.properties.map(element => <div className="property-wrapper" key={element.name}>{element.content}</div>)}
      </div>
    );
  }
}


export default ({
                  formData: initialFormData, basicMode, onChange = () => {
  }
                }) => {
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const formContext = {
    partialUpdate: ({ id, value }) => {
      const path = id.replace('root_', '').replace('_', '.')
      setFormData(state => set(state, path, value))
      // todo check if `Form.onChange` is called afterwards — to bubble up the new data state to the `Write` component
    }
  }

  const effectiveUiSchema = useMemo(() => (basicMode ? { ...uiSchema, ...basicUiSchema } : uiSchema), [basicMode])

  const yamlOutput = toYaml(formData)

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
