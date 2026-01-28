import { useTranslation } from 'react-i18next'

import CreatedByLabel from '../atoms/CreatedByLabel.jsx'
import UpdatedAtLabel from '../atoms/UpdatedAtLabel.jsx'

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
