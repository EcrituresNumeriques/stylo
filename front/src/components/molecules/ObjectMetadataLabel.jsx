import { CreatedByLabel, UpdatedAtLabel } from '../atoms/index.js'

export default function ObjectMetadataLabel({
  updatedAtDate,
  creatorName,
  ...props
}) {
  return (
    <div {...props}>
      <UpdatedAtLabel date={updatedAtDate} />
      <span> — </span>
      <CreatedByLabel name={creatorName} />
    </div>
  )
}
