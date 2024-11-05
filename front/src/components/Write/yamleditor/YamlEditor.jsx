import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import YAML from 'js-yaml'
import Form from '../../Form'
import { toYaml } from "../metadata/yaml.js"
import { convertLegacyValues } from "../../metadata/MetadataValues.js"
import defaultUiSchema from "../../../schemas/ui-schema-editor.json"
import basicUiSchema from "../../../schemas/ui-schema-basic-override.json"
import defaultSchema from '../../../schemas/data-schema.json'

export default function YamlEditor({ yaml = '', basicMode = false, onChange = () => {} }) {
  const effectiveUiSchema = useMemo(
    () => (basicMode ? { ...defaultUiSchema, ...basicUiSchema } : defaultUiSchema),
    [basicMode]
  )
  const [parsed = {}] = YAML.loadAll(yaml)
  const formData = convertLegacyValues(parsed)
  const handleChange = useCallback((newFormData) => onChange(toYaml(newFormData)), [onChange])
  return <Form formData={formData} schema={defaultSchema} uiSchema={effectiveUiSchema} onChange={handleChange}/>
}

YamlEditor.propTypes = {
  yaml: PropTypes.string,
  basicMode: PropTypes.bool,
  onChange: PropTypes.func
}
