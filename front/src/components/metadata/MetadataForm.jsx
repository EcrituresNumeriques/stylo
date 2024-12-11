import React from 'react'
import PropTypes from 'prop-types'

import Form from '../Form.jsx'
import { convertLegacyValues } from './MetadataValues.js'

/**
 * @param data Values in JSON format
 * @param schema Data schema
 * @param uiSchema UI schema
 * @param onChange Function that return the values in JSON format
 * @returns {Element}
 * @constructor
 */
export default function MetadataForm({ data, schema, uiSchema, onChange }) {
  const formData = convertLegacyValues(data)
  return (
    <Form
      formData={formData}
      schema={schema}
      uiSchema={uiSchema}
      onChange={onChange}
    />
  )
}

MetadataForm.propTypes = {
  data: PropTypes.object,
  schema: PropTypes.object,
  uiSchema: PropTypes.object,
  templates: PropTypes.array,
  onChange: PropTypes.func,
}
