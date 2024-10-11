import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import YAML from 'js-yaml'
import Form from '../../Form'
import { toYaml } from "../metadata/yaml.js";
import { convertLegacyValues } from "../../metadata/MetadataValues.js";

export default function YamlEditor({ yaml = '', basicMode = false, onChange = () => {} }) {
  const [parsed = {}] = YAML.loadAll(yaml)
  const formData = convertLegacyValues(parsed)
  const handleChange = useCallback((newFormData) => onChange(toYaml(newFormData)), [onChange])
  return <Form formData={formData} basicMode={basicMode} onChange={handleChange}/>
}

YamlEditor.propTypes = {
  yaml: PropTypes.string,
  basicMode: PropTypes.bool,
  onChange: PropTypes.func
}
