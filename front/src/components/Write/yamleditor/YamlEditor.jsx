import React from 'react'
import PropTypes from 'prop-types'
import YAML from 'js-yaml'
import Form from '../../Form'

export default function YamlEditor ({ yaml = '', basicMode = false, onChange }) {
  const [parsed = {}] = YAML.loadAll(yaml)

  // we convert YYYY/MM/DD dates into ISO YYYY-MM-DD
  if (parsed.date) {
    parsed.date = parsed.date.replace(/\//g, '-')
  }

  // we array-ify legacy string keywords
  if (parsed.keywords) {
    parsed.keywords = parsed.keywords.map(block => {
      if (typeof block.list_f === 'string') {
        block.list_f = block.list_f.split(',').map(word => word.trim())
      }

      return block
    })
  }

  return <Form formData={parsed} basicMode={basicMode} onChange={onChange} />
}

YamlEditor.propTypes = {
  yaml: PropTypes.string,
  basicMode: PropTypes.bool,
  onChange: PropTypes.func
}
