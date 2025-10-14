import { merge } from 'allof-merge'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import blogPostSchema from '../../../schemas/article-blog-post-metadata.schema.json'
import blogPostUiSchema from '../../../schemas/article-blog-post-ui-schema.json'
import meetingNotesSchema from '../../../schemas/article-meeting-notes-metadata.schema.json'
import meetingNotesUiSchema from '../../../schemas/article-meeting-notes-ui-schema.json'
import defaultSchema from '../../../schemas/article-metadata.schema.json'
import defaultUiSchema from '../../../schemas/article-ui-schema.json'
import Form from '../../Form'

import Select from '../../Select.jsx'

import styles from './ArticleEditorMetadataForm.module.scss'

const FormTypeDefaultOptions = [
  {
    name: 'default',
    data: defaultSchema,
    ui: defaultUiSchema,
  },
  {
    name: 'blog-post',
    data: blogPostSchema,
    ui: blogPostUiSchema,
  },
  {
    name: 'meeting-notes',
    data: meetingNotesSchema,
    ui: meetingNotesUiSchema,
  },
]

/**
 * @param {object} props properties
 * @param {any} props.metadata
 * @param {string} props.metadataFormType
 * @param {any} props.metadataFormTypeOptions
 * @param {boolean} props.readOnly
 * @param {(any) => void} props.onChange
 * @param {(any) => void} props.onTypeChange
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
    const defaultOption = FormTypeDefaultOptions.find((o) => o.name === type)
    if (defaultOption === undefined) {
      const option = metadataFormTypeOptions.find((o) => o.name === type)
      if (option) {
        return merge(option.data)
      }
      // QUESTION: what should we do, if we can't find the form?
      return merge(
        FormTypeDefaultOptions.find((o) => o.name === 'default').data
      )
    } else {
      return merge(defaultOption.data)
    }
  }, [metadataFormTypeOptions, type])
  const uiSchema = useMemo(() => {
    const defaultOption = FormTypeDefaultOptions.find((o) => o.name === type)
    if (defaultOption === undefined) {
      const option = metadataFormTypeOptions.find((o) => o.name === type)
      if (option) {
        return option.ui
      }
      // QUESTION: what should we do, if we can't find the form?
      return FormTypeDefaultOptions.find((o) => o.name === 'default').ui
    } else {
      return defaultOption.ui
    }
  }, [metadataFormTypeOptions, type])

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
