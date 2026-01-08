import { useTranslation } from 'react-i18next'

export default function CreatedByLabel({ name }) {
  const { t } = useTranslation()
  return (
    <span>
      {t('common.createdBy.label')} {name}
    </span>
  )
}
