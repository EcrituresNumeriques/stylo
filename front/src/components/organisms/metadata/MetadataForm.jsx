import Form from '../../molecules/Form.jsx'

/**
 * @param {object} props properties
 * @param {Record<string, unknown>} props.data Values in JSON format
 * @param {boolean} props.readOnly Whether the form is read-only
 * @param {Record<string, unknown>} props.schema Data schema
 * @param {Record<string, unknown>} props.uiSchema UI schema
 * @param {(formData: Record<string, unknown>) => void} props.onChange Function that return the values in JSON format
 * @param {Record<string, unknown>} props.context
 * @returns {JSX.Element}
 */
export default function MetadataForm({
  data,
  readOnly = false,
  schema,
  uiSchema,
  onChange,
  context = {},
}) {
  return (
    <Form
      readOnly={readOnly}
      formData={data}
      schema={schema}
      uiSchema={uiSchema}
      onChange={onChange}
      context={context}
    />
  )
}
