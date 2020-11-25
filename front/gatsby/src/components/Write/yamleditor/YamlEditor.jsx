import React, {useState} from 'react'
import YAML from 'js-yaml'

import Form from '../../Form.jsx'
import Select from '../../Select.jsx'
import schemas from '../../../schemas/index.js'

export default ({ yaml, basicMode, onChange }) => {
  const [metadataModelName, setMetadataModelName] = useState('default')
  const [parsed] = YAML.loadAll(yaml)

  // we convert YYYY/MM/DD dates into ISO YYYY-MM-DD
  if (parsed && parsed.date && typeof parsed.date === 'string') {
    parsed.date = parsed.date.replace(/\//g, '-')
  }

  <>
    <Select value={metadataModelName} onChange={(e) => setMetadataModelName(e.target.value)}>
      {Object.entries(schemas).map(([id, details]) => {
        return <option key={id} value={ id }>{ details.title }</option>
      })}
    </Select>

    <Form formData={parsed} basicMode={basicMode} metadataModelName={metadataModelName} onChange={onChange}/>
  </>
}
