import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ArticleSchemas } from '../../../schemas/schemas.js'
import { Select } from '../../atoms/index.js'

import Form from '../../molecules/Form.jsx'

import styles from './ArticleEditorMetadataForm.module.scss'

/**
 * @param {object} props properties
 * @param {Record<string, unknown>} props.metadata
 * @param {string} props.metadataFormType
 * @param {Array<{name: string, data: Record<string, unknown>, ui: Record<string, unknown>}>} props.metadataFormTypeOptions
 * @param {boolean} props.readOnly
 * @param {(formData: Record<string, unknown>) => void} props.onChange
 * @param {(type: string) => void} props.onTypeChange
 * @returns {Element}
 */
export default function ArticleEditorMetadataForm({
  metadata,
  metadataFormType = 'default',
  metadataFormTypeOptions = [],
  readOnly = false,
  onChange = () => {},
  onTypeChange = () => {},
}) {
  const [type, setType] = useState(metadataFormType)
  const schemaMerged = useMemo(() => {
    const schema = ArticleSchemas.find((o) => o.name === type)
    if (schema === undefined) {
      const option = metadataFormTypeOptions.find((o) => o.name === type)
      if (option) {
        return option.data
      }
      // QUESTION: what should we do, if we can't find the form?
      return ArticleSchemas.find((o) => o.name === 'default').data
    } else {
      return schema.data
    }
  }, [metadataFormTypeOptions, type])
  const uiSchema = useMemo(() => {
    const schema = ArticleSchemas.find((o) => o.name === type)
    if (schema === undefined) {
      const option = metadataFormTypeOptions.find((o) => o.name === type)
      if (option) {
        return option.ui
      }
      // QUESTION: what should we do, if we can't find the form?
      return ArticleSchemas.find((o) => o.name === 'default').ui
    } else {
      return schema.ui
    }
  }, [metadataFormTypeOptions, type])

  const handleChange = useCallback(
    (newFormData) => onChange(newFormData),
    [onChange]
  )

  const handleTypeChange = useCallback(
    (type) => {
      setType(type)
      const schema = ArticleSchemas.find((o) => o.name === type)
      if (schema && schema.const !== undefined) {
        handleChange({
          ...metadata,
          ...schema.const,
        })
      } else {
        // remove default const properties `@version` and `type` since we are using a custom schema
        const customMetadata = Object.fromEntries(
          Object.entries(metadata).filter(
            ([key]) => key !== '@version' && key !== 'type'
          )
        )
        handleChange(customMetadata)
      }
      onTypeChange(type)
    },
    [handleChange, setType, onTypeChange]
  )

  const { t } = useTranslation()
  return (
    <>
      <div className={styles.header}>
        <Select
          disabled={readOnly}
          label={t('article.type.label')}
          value={type}
          onChange={(event) => handleTypeChange(event?.target?.value ?? event)}
        >
          <option value="default">{t('article.type.default')}</option>
          <option value="blog-post">{t('article.type.blogPost')}</option>
          <option value="meeting-notes">
            {t('article.type.meetingNotes')}
          </option>
          <option value="chapter">{t('article.type.chapter')}</option>
          {metadataFormTypeOptions.map((option) => (
            <option key={option.name} value={option.name}>
              {option.name}
            </option>
          ))}
        </Select>
      </div>
      <Form
        readOnly={readOnly}
        formData={metadata}
        schema={schemaMerged}
        uiSchema={uiSchema}
        onChange={handleChange}
      />
    </>
  )
}
