import React from 'react'
import { Search } from 'lucide-react'

import SchemaForm from '../components/Form.jsx'
import schema from './form-story.schema.json'
import uiSchema from './form-story-ui-schema.json'

import Field from '../components/Field.jsx'
import Select from '../components/Select.jsx'
import buttonStyles from '../components/button.module.scss'

export default function FormStory() {
  return (
    <>
      <h4>Search</h4>
      <Field placeholder="Search" icon={Search} />
      <h4>Textarea</h4>
      <div style={{ 'max-width': '50%' }}>
        <textarea className={buttonStyles.textarea} rows="10">
          Du texte
        </textarea>
      </div>
      <h4>Select</h4>
      <Select>
        <option>Tome de Savoie</option>
        <option>Reblochon</option>
        <option>St Marcellin</option>
      </Select>

      <SchemaForm formData={{}} uiSchema={uiSchema} schema={schema} />
    </>
  )
}
