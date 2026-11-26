import Form, { getDefaultRegistry } from '@rjsf/core'
import validator from '@rjsf/validator-ajv8'
import clsx from 'clsx'
import { Plus, Trash } from 'lucide-react'
import { set } from 'object-path-immutable'
import { Fragment, useCallback, useMemo, useState } from 'react'
import { Translation } from 'react-i18next'

import { Button } from '../atoms/index.js'

// REMIND: use a custom SelectWidget to support "ui:emptyValue"
import styles from './form.module.scss'
// remove once fixed in https://github.com/rjsf-team/react-jsonschema-form/issues/1041
import SelectWidget from './SelectWidget.jsx'
import ToggleWidget from './ToggleWidget.jsx'

const {
  templates: { BaseInputTemplate: DefaultBaseInputTemplate },
  widgets: { CheckboxesWidget },
} = getDefaultRegistry()

/**
 * @param {BaseInputTemplate} properties
 * @returns {JSX.Element}
 */
function BaseInputTemplate(properties) {
  const { placeholder } = properties
  return (
    <Translation ns="form" useSuspense={false}>
      {(t) => (
        <DefaultBaseInputTemplate
          {...properties}
          placeholder={t(placeholder)}
        />
      )}
    </Translation>
  )
}

/**
 * @param {SelectWidget} properties
 * @returns {JSX.Element}
 */
function CustomSelectWidget(properties) {
  const { options, title, placeholder } = properties
  return (
    <div
      className={clsx(
        styles.selectContainer,
        (properties.disabled || properties.readonly) && styles.selectDisabled
      )}
    >
      <Translation ns="form" useSuspense={false}>
        {(t) => (
          <SelectWidget
            {...{
              ...properties,
              placeholder: t(placeholder),
              options: {
                enumOptions: options?.enumOptions?.map((opt) => {
                  if (title && opt.label in title) {
                    return {
                      label: t(title[opt.label]),
                      value: opt.value,
                    }
                  }
                  return {
                    label: t(opt.label),
                    value: opt.value,
                  }
                }),
              },
            }}
          />
        )}
      </Translation>
    </div>
  )
}

/**
 * @param {WidgetProps} properties
 * @returns {JSX.Element}
 */
function CustomCheckboxesWidget(properties) {
  const { options, title } = properties
  return (
    <Translation ns="form" useSuspense={false}>
      {(t) => (
        <CheckboxesWidget
          {...{
            ...properties,
            options: {
              enumOptions: options?.enumOptions?.map((opt) => {
                if (title && opt.label in title) {
                  return {
                    label: t(title[opt.label]),
                    value: opt.value,
                  }
                }
                return {
                  label: t(opt.label),
                  value: opt.value,
                }
              }),
            },
          }}
        />
      )}
    </Translation>
  )
}

/**
 * @param {ArrayFieldTemplateProps} properties
 * @returns {JSX.Element}
 */
function ArrayFieldTemplate(properties) {
  const addItemTitle =
    properties.uiSchema['ui:add-item-title'] ?? 'form.itemAdd'
  const removeItemTitle =
    properties.uiSchema['ui:remove-item-title'] ?? 'form.itemRemove'
  const title = properties.uiSchema['ui:title']
  const inlineRemoveButton =
    properties.schema?.items?.type === 'string' || !removeItemTitle
  const items = [...properties.items].reverse()
  return (
    <fieldset
      className={clsx(styles.fieldset, styles.array)}
      key={properties.key}
    >
      {title && (
        <Translation ns="form" useSuspense={false}>
          {(t) => <legend id={properties.id}>{t(title)}</legend>}
        </Translation>
      )}
      {properties.canAdd && (
        <Button
          disabled={properties.disabled || properties.readonly}
          type="button"
          className={styles.addButton}
          tabIndex={-1}
          onClick={properties.onAddClick}
        >
          <Plus />
          <Translation ns="form" useSuspense={false}>
            {(t) => t(addItemTitle)}
          </Translation>
        </Button>
      )}
      {items?.map((element) => {
        return (
          <div
            id={element.key}
            key={element.key}
            className={clsx(
              element.className,
              'can-add-remove',
              element?.uiSchema?.['ui:className']
            )}
          >
            {element.children}
            {element.hasRemove && (
              <Button
                icon={inlineRemoveButton}
                type="button"
                className={[
                  styles.removeButton,
                  inlineRemoveButton ? styles.inlineRemoveButton : '',
                ].join(' ')}
                tabIndex={-1}
                disabled={element.disabled || element.readonly}
                onClick={element.onDropIndexClick(element.index)}
              >
                <Trash />
                {inlineRemoveButton ? (
                  ''
                ) : (
                  <Translation ns="form" useSuspense={false}>
                    {(t) => t(removeItemTitle)}
                  </Translation>
                )}
              </Button>
            )}
          </div>
        )
      })}
    </fieldset>
  )
}

function FieldTemplate(properties) {
  const {
    id,
    classNames,
    style,
    help,
    description,
    errors,
    children,
    displayLabel,
  } = properties
  const label = properties.schema.$id
    ? properties.label[properties.schema.$id]
    : properties.label

  if (properties.hidden) {
    return null
  }
  return (
    <div className={classNames} style={style}>
      {displayLabel && (
        <label htmlFor={id}>
          <Translation ns="form" useSuspense={false}>
            {(t) => <>{t(label)}</>}
          </Translation>
        </label>
      )}
      {description}
      {children}
      {errors}
      {help}
    </div>
  )
}

/**
 * @param {ObjectFieldTemplateProps} properties
 * @param {object} extensions
 * @param {Record<string, React.ComponentType>} extensions.fields custom fields
 * @param {RenderGroupAction} [extensions.renderGroupAction]
 * @returns {JSX.Element|undefined}
 */
function ObjectFieldTemplate(
  properties,
  { fields: customFields, renderGroupAction }
) {
  if (properties.uiSchema['ui:groups']) {
    const groups = properties.uiSchema['ui:groups']
    const groupedElements = groups.map((group) => {
      const { fields, title } = group
      const elements = fields
        .filter(
          (field) => properties.uiSchema[field]?.['ui:widget'] !== 'hidden'
        )
        .map((field) => {
          const element = properties.properties.find(
            (element) => element.name === field
          )

          if (!element) {
            console.error(
              'Field configuration not found for "%s" in \'ui:groups\' "%s" — part of %o',
              field,
              title || '',
              fields
            )
          }

          return [field, element]
        })

      if (elements && elements.length > 0) {
        return (
          <fieldset className={styles.fieldset} key={fields.join('-')}>
            {title && (
              <legend className={styles.legend}>
                <Translation ns="form" useSuspense={false}>
                  {(t) => <>{t(title)}</>}
                </Translation>
                {renderGroupAction?.(group, {
                  update: (value) =>
                    properties.formContext.partialUpdate({
                      id: properties.idSchema.$id,
                      value,
                    }),
                })}
              </legend>
            )}
            {elements.map(([field, element]) => {
              return element ? (
                <Fragment key={field}>{element.content}</Fragment>
              ) : (
                <p key={field} className={styles.fieldHasNoElementError}>
                  Field <code>{field}</code> defined in <code>ui:groups</code>{' '}
                  is not an entry of <code>data-schema.json[properties]</code>{' '}
                  object.
                </p>
              )
            })}
          </fieldset>
        )
      }
    })

    return <>{groupedElements}</>
  }

  if (properties) {
    const AutocompleteField =
      customFields[properties.uiSchema['ui:autocomplete']]
    return (
      <Fragment key={properties.key}>
        {properties.description}
        {AutocompleteField && <AutocompleteField {...properties} />}
        {properties.properties.map((element) => (
          <Fragment key={element.name}>{element.content}</Fragment>
        ))}
      </Fragment>
    )
  }
}

const customWidgets = {
  SelectWidget: CustomSelectWidget,
  CheckboxesWidget: CustomCheckboxesWidget,
  toggle: ToggleWidget,
}

const EMPTY_FIELDS = {}

/**
 * Renders an extra element (button, menu…) next to the title of a group of fields.
 * @callback RenderGroupAction
 * @param {{fields: string[], title?: string, [key: string]: unknown}} group entry of `ui:groups`
 * @param {{update: (value: Record<string, unknown>) => void}} actions `update` sets the value of the object that holds the group
 * @returns {React.ReactNode}
 */

/**
 * Form generated from a JSON schema.
 *
 * This component knows nothing about the application domains: domain-specific
 * fields and actions are provided by the caller (`fields`, `renderGroupAction`).
 * @param {object} props properties
 * @param {Record<string, unknown>} props.formData
 * @param {boolean} props.readOnly
 * @param {Record<string, unknown>} props.schema
 * @param {Record<string, unknown>} props.uiSchema
 * @param {(formData: Record<string, unknown>) => void} props.onChange
 * @param {Record<string, React.ComponentType>} props.fields custom fields, referenced by name in the UI schema (`ui:field` or `ui:autocomplete`)
 * @param {RenderGroupAction} props.renderGroupAction
 * @returns {Element}
 */
export default function SchemaForm({
  formData: initialFormData,
  readOnly,
  schema,
  uiSchema,
  onChange = () => {},
  fields = EMPTY_FIELDS,
  renderGroupAction,
}) {
  const [formData, setFormData] = useState(initialFormData)
  const [, setErrors] = useState({})
  const formContext = useMemo(
    () => ({
      partialUpdate: ({ id, value }) => {
        const path = id.replace('root', '').replace(/^_/, '').replace('_', '.')
        setFormData((state) => {
          const newFormData = set(state, path, value)
          onChange(newFormData)
          return newFormData
        })
      },
    }),
    [onChange, setFormData]
  )

  const customTemplates = useMemo(
    () => ({
      ObjectFieldTemplate: (properties) =>
        ObjectFieldTemplate(properties, { fields, renderGroupAction }),
      FieldTemplate,
      BaseInputTemplate,
      ArrayFieldTemplate,
    }),
    [fields, renderGroupAction]
  )

  const handleUpdate = useCallback(
    (event) => {
      const formData = event.formData
      setFormData(formData)
      onChange(formData)
    },
    [setFormData, onChange]
  )

  // noinspection JSValidateTypes
  return (
    <Form
      readonly={readOnly}
      className={styles.form}
      formContext={formContext}
      schema={schema}
      name="Metadata"
      templates={customTemplates}
      widgets={customWidgets}
      fields={fields}
      uiSchema={uiSchema}
      formData={formData}
      onChange={handleUpdate}
      onError={setErrors}
      validator={validator}
    >
      <hr hidden={true} />
    </Form>
  )
}
