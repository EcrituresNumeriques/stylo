import sensPublicBasicUiSchema from '../schemas/sens-public/ui-schema-basic-override.json'
import sensPublicUiSchema from '../schemas/sens-public/ui-schema-editor.json'
import sensPublicSchema from '../schemas/sens-public/data-schema.json'
import defaultUiSchema from '../schemas/default/ui-schema-editor.json'
import defaultSchema from '../schemas/default/data-schema.json'

const allSchemas = {
  'default': {
    title: 'Générique',
    basicUiSchema: defaultUiSchema,
    uiSchema: defaultUiSchema,
    schema: defaultSchema
  },
  'sens-public': {
    title: 'Sens Public',
    basicUiSchema: {...sensPublicUiSchema, ...sensPublicBasicUiSchema},
    uiSchema: sensPublicUiSchema,
    schema: sensPublicSchema
  },
}

export default allSchemas
