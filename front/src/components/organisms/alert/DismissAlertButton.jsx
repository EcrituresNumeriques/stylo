import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import Button from '../../atoms/Button.jsx'

import styles from '../../molecules/Alert.module.scss'

export default function DismissAlertButton({ onClick }) {
  const { t } = useTranslation()

  return (
    <Button
      icon
      small
      className={styles.dismiss}
      title={t('main.alerts.dismiss')}
      aria-label={t('main.alerts.dismiss')}
      onClick={onClick}
    >
      <X aria-hidden size="1em" />
    </Button>
  )
}
