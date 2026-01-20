import { useTranslation } from 'react-i18next'

/**
 * @param name
 * @returns {JSX.Element}
 * @constructor
 */
export default function CreatedByLabel({ name }) {
  const { t } = useTranslation()
  return (
    <span>
      {t('common.createdBy.label')} {name}
    </span>
  )
}
