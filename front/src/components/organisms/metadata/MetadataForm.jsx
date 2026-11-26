import Form from '../../molecules/Form.jsx'

import IsidoreAuthorSearch from './isidoreAuthor.jsx'
import IsidoreKeywordSearch from './isidoreKeyword.jsx'

// fields referenced by name in the UI schemas (`ui:field` or `ui:autocomplete`)
const fields = {
  IsidoreKeywordSearch,
  IsidoreAuthorSearch,
}

/**
 * @param {object} props properties
 * @param {Record<string, unknown>} props.data Values in JSON format
 * @param {boolean} props.readOnly Whether the form is read-only
 * @param {Record<string, unknown>} props.schema Data schema
 * @param {Record<string, unknown>} props.uiSchema UI schema
 * @param {(formData: Record<string, unknown>) => void} props.onChange Function that return the values in JSON format
 * @param {import('../../molecules/Form.jsx').RenderGroupAction} props.renderGroupAction Renders an extra element next to the title of a group of fields
 * @returns {JSX.Element}
 */
export default function MetadataForm({
  data,
  readOnly = false,
  schema,
  uiSchema,
  onChange,
  renderGroupAction,
}) {
  return (
    <Form
      readOnly={readOnly}
      formData={data}
      schema={schema}
      uiSchema={uiSchema}
      onChange={onChange}
      fields={fields}
      renderGroupAction={renderGroupAction}
    />
  )
}
