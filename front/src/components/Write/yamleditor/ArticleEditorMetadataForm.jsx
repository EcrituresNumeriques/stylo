import React, { useCallback, useMemo } from 'react'
import { merge } from 'allof-merge'
import PropTypes from 'prop-types'
import Form from '../../Form'
import { convertLegacyValues } from '../../metadata/MetadataValues.js'
import uiSchema from '../../../schemas/article-ui-schema.json'
import schema from '../../../schemas/article-metadata.schema.json'

export default function ArticleEditorMetadataForm({
  metadata,
  onChange = () => {},
}) {
  const formData = convertLegacyValues(metadata)
  const schemaMerged = useMemo(() => merge(schema), [schema])
  const handleChange = useCallback(
    (newFormData) => onChange(newFormData),
    [onChange]
  )
  return (
    <Form
      formData={formData}
      schema={schemaMerged}
      uiSchema={uiSchema}
      onChange={handleChange}
    />
  )
}

ArticleEditorMetadataForm.propTypes = {
  metadata: PropTypes.object,
  basicMode: PropTypes.bool,
  onChange: PropTypes.func,
}
