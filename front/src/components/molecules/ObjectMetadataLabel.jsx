import { useTranslation } from 'react-i18next'

import { CreatedByLabel, UpdatedAtLabel } from '../atoms/index.js'

export default function ObjectMetadataLabel({
  updatedAtDate,
  creatorName,
  ...props
}) {
  const { t } = useTranslation()
  return (
    <div {...props}>
      <UpdatedAtLabel date={updatedAtDate} />
      <span> — </span>
      <CreatedByLabel name={creatorName} />
    </div>
  )
}
