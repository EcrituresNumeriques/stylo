import React from 'react'
import PropTypes from 'prop-types'

import Form from '../Form.jsx'

/**
 * @param {object} props properties
 * @param {any} props.data Values in JSON format
 * @param {boolean} props.readOnly Values in JSON format
 * @param {any} props.schema Data schema
 * @param {any} props.uiSchema UI schema
 * @param {(any) => void} props.onChange Function that return the values in JSON format
 * @returns {Element}
 */
export default function MetadataForm({
  data,
  readOnly = false,
  schema,
  uiSchema,
  onChange,
}) {
  return (
    <Form
      readOnly={readOnly}
      formData={data}
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
