import { useTranslation } from 'react-i18next'

import TimeAgo from './TimeAgo.jsx'

/**
 * @param date
 * @returns {JSX.Element}
 * @constructor
 */
export default function UpdatedAtLabel({ date }) {
  const { t } = useTranslation()
  return (
    <span>
      {t('common.updatedAt.label')} <TimeAgo date={date}></TimeAgo>
    </span>
  )
}
