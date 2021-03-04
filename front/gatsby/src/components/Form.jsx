import React, { Fragment, useMemo, useState } from 'react'
import Form from '@rjsf/core'
import { set } from 'object-path-immutable'
import staticKeywordsComponent from './Write/metadata/staticKeywords.js'
import schemas from '../schemas/index.js' // { default: { uiSchema, schema }}
import { toYaml } from './Write/metadata/yaml'

// REMIND: use a custom SelectWidget to support "ui:emptyValue"
// remove once fixed in https://github.com/rjsf-team/react-jsonschema-form/issues/1041
import SelectWidget from './SelectWidget'

import styles from './form.module.scss'
import Button from './Button'
import { Plus, Trash } from 'react-feather'

const CustomSelect = function(props) {
  return (<div className={styles.selectContainer}>
      <SelectWidget {...props}/>
    </div>)
}

function ArrayFieldTemplate (props) {

  const addItemTitle = props.uiSchema['ui:add-item-title'] || 'Add'
  const removeItemTitle = props.uiSchema['ui:remove-item-title'] || 'Remove'
  const title = props.uiSchema['ui:title']

  const inlineRemoveButton = props.schema?.items?.type === 'string'
  return (
    <fieldset className={styles.fieldset} key={props.key}>
      {title && <legend id={props.id}>{title}</legend>}
      {props.items &&
        props.items.map((element) => (
          <div
            id={element.key}
            key={element.key}
            className={`${element.className} can-add-remove`}
          >
            {element.children}
            {element.hasRemove && (
              <Button
                icon={inlineRemoveButton}
                type="button"
                className={[styles.removeButton, inlineRemoveButton ? styles.inlineRemoveButton : ''].join(' ')}
                tabIndex={-1}
                disabled={element.disabled || element.readonly}
                onClick={element.onDropIndexClick(element.index)}
              >
                <Trash/>
                {inlineRemoveButton ? '' : removeItemTitle}
              </Button>
            )}
          </div>
        ))}
      {props.canAdd && (
        <Button
          type="button"
          className={styles.addButton}
          tabIndex={-1}
          onClick={props.onAddClick}
        >
          <Plus/>
          {addItemTitle}
        </Button>
      )}
    </fieldset>
  )
}

function ObjectFieldTemplate (props) {
  if (props.uiSchema['ui:groups']) {
    const groups = props.uiSchema['ui:groups']
    const groupedElements = groups.map(({ fields, title }) => {
      const elements = fields
        .filter((field) => {
          const fieldExists = props.schema.properties.hasOwnProperty(field)
          if (!fieldExists) {
            console.error('Field %s is declared in ui:group, but does not exist in data schema', field)
          }

          return fieldExists
        })
        .filter(
          (field) => (props.uiSchema[field] || {})['ui:widget'] !== 'hidden'
        )
        .map(
          (field) =>
            props.properties.filter((element) => element.name === field)[0]
        )
      if (elements && elements.length > 0) {
        return (
          <fieldset className={styles.fieldset} key={fields.join('-')}>
            {title && <legend>{title}</legend>}
            {elements.map((element) => (
              <Fragment key={element.name}>{element.content}</Fragment>
            ))}
          </fieldset>
        )
      }
    })

    return <>{groupedElements}</>
  }

  if (props) {
    return (
      <Fragment key={props.key}>
        {props.title}
        {props.description}
        {props.properties.map((element) => (
          <Fragment key={element.name}>{element.content}</Fragment>
        ))}
      </Fragment>
    )
  }
}

export default function MetadataForm (props) {
  const { basicMode, metadataModelName } = props
  const { formData: initialFormData, onChange = () => {} } = props

  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const formContext = {
    partialUpdate: ({ id, value }) => {
      const path = id.replace('root_', '').replace('_', '.')
      setFormData((state) => {
        const newFormData = set(state, path, value)
        onChange(toYaml(newFormData))
        return newFormData
      })
    },
  }

  const {basicUiSchema, uiSchema, schema} = schemas[metadataModelName]
  const effectiveUiSchema = useMemo(() => {
    return basicMode
      ? basicUiSchema
      : uiSchema
    },
    [basicMode, metadataModelName]
  )

  // use static keywords component
  effectiveUiSchema.controlledKeywords = {
    ...effectiveUiSchema.controlledKeywords,
    ...staticKeywordsComponent.uiSchema,
  }

  const customWidgets = {
    SelectWidget: CustomSelect
  }

  return (
    <Form
      className={styles.form}
      ObjectFieldTemplate={ObjectFieldTemplate}
      ArrayFieldTemplate={ArrayFieldTemplate}
      formContext={formContext}
      schema={schema}
      widgets={customWidgets}
      uiSchema={effectiveUiSchema}
      formData={formData}
      onChange={(e) => {
        setFormData(e.formData)
        onChange(toYaml(e.formData))
      }}
      onError={setErrors}
    >
      <hr hidden={true} />
    </Form>
  )
}
