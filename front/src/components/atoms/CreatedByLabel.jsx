import { useTranslation } from 'react-i18next'

/**
 * @param {object} name
 * @param {string} name.name
 * @returns {JSX.Element}
 */
export default function CreatedByLabel({ name }) {
  const { t } = useTranslation()
  return (
    <span>
      {t('common.createdBy.label')} {name}
    </span>
  )
}
