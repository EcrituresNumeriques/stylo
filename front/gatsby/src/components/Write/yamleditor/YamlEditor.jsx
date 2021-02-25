import React from 'react'
import Form from '../../Form'
import YAML from 'js-yaml'

export default ({ yaml, basicMode, onChange }) => {
  const [parsed] = YAML.loadAll(yaml)

  // we convert YYYY/MM/DD dates into ISO YYYY-MM-DD
  if (parsed.date) {
    parsed.date = parsed.date.replace(/\//g, '-')
  }

  return <Form formData={parsed} basicMode={basicMode} onChange={onChange} />
}
