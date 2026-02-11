import { useTranslation } from 'react-i18next'

import TimeAgo from './TimeAgo.jsx'

/**
 * @param {object} date
 * @param {string} date.date
 * @returns {JSX.Element}
 */
export default function UpdatedAtLabel({ date }) {
  const { t } = useTranslation()
  return (
    <span>
      {t('common.updatedAt.label')} <TimeAgo date={date}></TimeAgo>
    </span>
  )
}
