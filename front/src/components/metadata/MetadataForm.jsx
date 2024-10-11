import React from "react";
import PropTypes from "prop-types";

import Form from "../Form.jsx";
import {convertLegacyValues} from "./MetadataValues.js";

/**
 * @param data Values in JSON format
 * @param templates List of template names
 * @param onChange Function that return the values in YAML format
 * @returns {Element}
 * @constructor
 */
export default function MetadataForm({data, templates, onChange}) {
  const formData = convertLegacyValues(data)
  const basicMode = templates.includes('basic')
  return <Form formData={formData} basicMode={basicMode} onChange={onChange}/>
}

MetadataForm.propTypes = {
  data: PropTypes.object,
  templates: PropTypes.array,
  onChange: PropTypes.func,
}

