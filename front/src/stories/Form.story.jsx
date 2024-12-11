import React from 'react'
import SchemaForm from '../components/Form.jsx'
import schema from './form-story.schema.json'
import uiSchema from './form-story-ui-schema.json'

export default function FormStory() {
  return (
    <>
      <h2>Form</h2>
      <SchemaForm formData={{}} uiSchema={uiSchema} schema={schema} />
    </>
  )
}
