import PropTypes from 'prop-types'
import React, { Fragment, useCallback, useMemo, useState } from 'react'
import Form, { getDefaultRegistry } from '@rjsf/core'
import validator from '@rjsf/validator-ajv8'
import { set } from 'object-path-immutable'
import { Translation } from 'react-i18next'
import basicUiSchema from '../schemas/ui-schema-basic-override.json'
import defaultUiSchema from '../schemas/ui-schema-editor.json'
import defaultSchema from '../schemas/data-schema.json'

// REMIND: use a custom SelectWidget to support "ui:emptyValue"
// remove once fixed in https://github.com/rjsf-team/react-jsonschema-form/issues/1041
import SelectWidget from './SelectWidget'
import isidoreKeywordSearch from './Write/metadata/isidoreKeyword'
import isidoreAuthorSearch from './Write/metadata/isidoreAuthor'

import styles from './form.module.scss'
import Button from './Button'
import { Plus, Trash } from 'react-feather'
import IsidoreAuthorAPIAutocompleteField from './Write/metadata/isidoreAuthor'

const {
  templates: { BaseInputTemplate: DefaultBaseInputTemplate },
  widgets: { CheckboxesWidget}
} = getDefaultRegistry()

/**
 * @param {BaseInputTemplate} properties
 */
function BaseInputTemplate (properties) {
  const { placeholder } = properties
  return (<Translation>
    {
      (t) => <DefaultBaseInputTemplate {...properties} placeholder={t(placeholder)}/>
    }
  </Translation>)
}

/**
 * @param {SelectWidget} properties
 */
function CustomSelectWidget (properties) {
  const { options, title, placeholder } = properties
  return (<div className={styles.selectContainer}>
    <Translation>
      {
        (t) => <SelectWidget {...{
          ...properties, placeholder: t(placeholder), options: {
            enumOptions: options?.enumOptions?.map((opt) => {
              if (title && opt.label in title) {
                return {
                  label: t(title[opt.label]),
                  value: opt.value
                }
              }
              return {
                label: t(opt.label),
                value: opt.value
              }
            })
          }
        }}/>
      }
    </Translation>
  </div>)
}

/**
 * @param {WidgetProps} properties
 */
function CustomCheckboxesWidget (properties) {
  const { options, title } = properties
  return (<Translation>
    {
      (t) => <CheckboxesWidget {...{
        ...properties, options: {
          enumOptions: options?.enumOptions?.map((opt) => {
            if (title && opt.label in title) {
              return {
                label: t(title[opt.label]),
                value: opt.value
              }
            }
            return {
              label: t(opt.label),
              value: opt.value
            }
          })
        }
      }}/>
    }
  </Translation>)
}

/**
 * @param {ArrayFieldTemplateProps} properties
 */
function ArrayFieldTemplate (properties) {
  const addItemTitle = properties.uiSchema['ui:add-item-title'] ?? 'form.addItem.title'
  const removeItemTitle = properties.uiSchema['ui:remove-item-title'] ?? 'form.removeItem.title'
  const title = properties.uiSchema['ui:title']

  const inlineRemoveButton = properties.schema?.items?.type === 'string' || !removeItemTitle
  return (
    <fieldset className={styles.fieldset} key={properties.key}>
      {title && <Translation>{(t) => <legend id={properties.id}>{t(title)}</legend>}</Translation>}
      {properties.items &&
        properties.items.map((element) => (
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
                {inlineRemoveButton ? '' : <Translation>
                  {(t) => t(removeItemTitle)}
                </Translation>}
              </Button>
            )}
          </div>
        ))}
      {properties.canAdd && (
        <Button
          type="button"
          className={styles.addButton}
          tabIndex={-1}
          onClick={properties.onAddClick}
        >
          <Plus/>
          <Translation>
            {(t) => t(addItemTitle)}
          </Translation>
        </Button>
      )}
    </fieldset>
  )
}

function FieldTemplate (properties) {
  const { id, classNames, style, help, description, errors, children, displayLabel } = properties
  const label = properties.schema.$id
    ? properties.label[properties.schema.$id]
    : properties.label
  return (
    <div className={classNames} style={style}>
      {displayLabel && <label htmlFor={id}>
        <Translation>
          {
            (t) => <>{t(label)}</>
          }
        </Translation>
      </label>}
      {description}
      {children}
      {errors}
      {help}
    </div>
  )
}

/**
 * @param {ObjectFieldTemplateProps} properties
 */
function ObjectFieldTemplate (properties) {
  if (properties.uiSchema['ui:groups']) {
    const groups = properties.uiSchema['ui:groups']
    const groupedElements = groups.map(({ fields, title }) => {
      const elements = fields
        .filter(
          (field) => (properties.uiSchema[field] || {})['ui:widget'] !== 'hidden'
        )
        .map((field) => {
          const element = properties.properties.find((element) => element.name === field)

          if (!element) {
            console.error('Field configuration not found for "%s" in \'ui:groups\' "%s" — part of %o', field, title, fields)
          }

          return [field, element]
        })

      if (elements && elements.length > 0) {
        return (
          <fieldset className={styles.fieldset} key={fields.join('-')}>
            {title && <legend>
              <Translation>
                {
                  (t) => <>{t(title)}</>
                }
              </Translation>
            </legend>}
            {elements.map(([field, element]) => (
              element
                ? <Fragment key={field}>{element.content}</Fragment>
                : <p key={field} className={styles.fieldHasNoElementError}>
                  Field <code>{field}</code> defined in <code>ui:groups</code> is not an
                  entry of <code>data-schema.json[properties]</code> object.
                </p>
            ))}
          </fieldset>
        )
      }
    })

    return <>{groupedElements}</>
  }

  if (properties) {
    const autocomplete = properties.uiSchema['ui:autocomplete']
    return (
      <Fragment key={properties.key}>
        {properties.description}
        {autocomplete === 'IsidoreAuthorSearch' && <IsidoreAuthorAPIAutocompleteField {...properties}/>}
        {properties.properties.map((element) => (
          <Fragment key={element.name}>{element.content}</Fragment>
        ))}
      </Fragment>
    )
  }
}

const customFields = {
  IsidoreKeywordSearch: isidoreKeywordSearch,
  IsidoreAuthorSearch: isidoreAuthorSearch,
}

/**
 *
 * @param initialFormData
 * @param basicMode
 * @param {(any) => void} onChange
 * @return {Element}
 * @constructor
 */
export default function SchemaForm ({
  formData: initialFormData,
  basicMode,
  onChange = () => {
  },
}) {
  const [formData, setFormData] = useState(initialFormData)
  const [, setErrors] = useState({})
  const formContext = useMemo(() => ({
    partialUpdate: ({ id, value }) => {
      const path = id.replace('root_', '').replace('_', '.')
      setFormData((state) => {
        const newFormData = set(state, path, value)
        onChange(newFormData)
        return newFormData
      })
    },
  }), [onChange, setFormData])

  const effectiveUiSchema = useMemo(
    () => (basicMode ? { ...defaultUiSchema, ...basicUiSchema } : defaultUiSchema),
    [basicMode]
  )

  const customWidgets = {
    SelectWidget: CustomSelectWidget,
    CheckboxesWidget: CustomCheckboxesWidget,
  }

  const customTemplates = {
    ObjectFieldTemplate,
    FieldTemplate,
    BaseInputTemplate,
    ArrayFieldTemplate
  }

  const handleUpdate = useCallback((event) => {
    const formData = event.formData
    setFormData(formData)
    onChange(formData)
  }, [setFormData, onChange])

  // noinspection JSValidateTypes
  return (
    <Form
      className={styles.form}
      formContext={formContext}
      schema={defaultSchema}
      name="Metadata"
      templates={customTemplates}
      widgets={customWidgets}
      fields={customFields}
      uiSchema={effectiveUiSchema}
      formData={formData}
      onChange={handleUpdate}
      onError={setErrors}
      validator={validator}
    >
      <hr hidden={true}/>
    </Form>
  )
}

SchemaForm.propTypes = {
  formData: PropTypes.object,
  basicMode: PropTypes.bool,
  onChange: PropTypes.func
}
