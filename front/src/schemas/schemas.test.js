import YAML from 'js-yaml'
import Form from '@rjsf/core'

import schema from './data-schema.json'
import uiSchema from './ui-schema-editor.json'
import defaultsData from '../../../graphql/data/defaultsData.js'

describe('schemas', () => {
  test('dataSchema and uiSchema are validated', () => {
    const FormComponent = new Form.default({ schema, uiSchema })

    expect(FormComponent.validate()).toHaveProperty('errors', [])
  })

  test('dataSchema and uiSchema and formData work well together', () => {
    const [formData] = YAML.loadAll(defaultsData.yaml)
    const FormComponent = new Form.default({ schema, uiSchema, formData })

    expect(FormComponent.validate()).toHaveProperty('errors', [])
  })
})
