import { merge } from 'allof-merge'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import blogPostSchema from '../../../schemas/article-blog-post-metadata.schema.json'
import blogPostUiSchema from '../../../schemas/article-blog-post-ui-schema.json'
import defaultSchema from '../../../schemas/article-metadata.schema.json'
import defaultUiSchema from '../../../schemas/article-ui-schema.json'
import Form from '../../Form'

import Select from '../../Select.jsx'

import styles from './ArticleEditorMetadataForm.module.scss'

/**
 * @param {object} props properties
 * @param {any} props.metadata
 * @param {string} props.metadataFormType
 * @param {boolean} props.readOnly
 * @param {(any) => void} props.onChange
 * @param {(any) => void} props.onTypeChange
 * @returns {Element}
 */
export default function ArticleEditorMetadataForm({
  metadata,
  metadataFormType,
  readOnly = false,
  onChange = () => {},
  onTypeChange = () => {},
}) {
  const [type, setType] = useState(metadataFormType)
  const schemaMerged = useMemo(
    () => (type === 'default' ? merge(defaultSchema) : merge(blogPostSchema)),
    [defaultSchema, blogPostSchema, type]
  )
  const uiSchema = useMemo(
    () => (type === 'default' ? defaultUiSchema : blogPostUiSchema),
    [type]
  )
  const handleChange = useCallback(
    (newFormData) => onChange(newFormData),
    [onChange]
  )

  const handleTypeChange = useCallback(
    (type) => {
      setType(type)
      onTypeChange(type)
    },
    [setType, onTypeChange]
  )

  const { t } = useTranslation()
  return (
    <>
      <div className={styles.header}>
        <Select
          label={t('article.type.label')}
          value={type}
          onChange={(event) => handleTypeChange(event?.target?.value ?? event)}
        >
          <option value="default">{t('article.type.default')}</option>
          <option value="blog-post">{t('article.type.blogPost')}</option>
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
