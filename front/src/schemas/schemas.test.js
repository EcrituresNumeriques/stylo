import YAML from 'js-yaml'
import Form from '@rjsf/core'

import schema from './data-schema.json'
import uiSchema from './ui-schema-editor.json'
import defaultsData from '../../../graphql/data/defaultsData.js'

describe('schemas', () => {
  test('dataSchema and uiSchema are validated', () => {
    const formData = { title_f: 'Test' }
    const FormComponent = new Form.default({ schema, uiSchema, formData })

    expect(FormComponent.validate()).toHaveProperty('errors', [])
  })

  test('dataSchema and uiSchema and formData work well together', () => {
    const [baseFormData] = YAML.loadAll(defaultsData.yaml)
    const formData = { ...baseFormData, title_f : 'Test' }
    const FormComponent = new Form.default({ schema, uiSchema, formData })

    expect(FormComponent.validate()).toHaveProperty('errors', [])
  })
})
