import React, { useCallback, useMemo } from 'react'
import { merge } from 'allof-merge'
import Form from '../../Form'
import uiSchema from '../../../schemas/article-ui-schema.json'
import schema from '../../../schemas/article-metadata.schema.json'

/**
 * @param {object} props properties
 * @param {any} props.metadata
 * @param {boolean} props.readOnly
 * @param {(any) => void} props.onChange
 * @returns {Element}
 */
export default function ArticleEditorMetadataForm({
  metadata,
  readOnly = false,
  onChange = () => {},
}) {
  const schemaMerged = useMemo(() => merge(schema), [schema])
  const handleChange = useCallback(
    (newFormData) => onChange(newFormData),
    [onChange]
  )
  return (
    <Form
      readOnly={readOnly}
      formData={metadata}
      schema={schemaMerged}
      uiSchema={uiSchema}
      onChange={handleChange}
    />
  )
}
