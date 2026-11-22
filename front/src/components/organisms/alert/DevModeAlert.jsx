import clsx from 'clsx'
import { Info } from 'lucide-react'

import { useDismissedAlerts } from '../../../hooks/alerts.js'
import styles from '../../molecules/Alert.module.scss'
import DismissAlertButton from './DismissAlertButton.jsx'

const alertId = 'dev-mode'

export default function DevModeAlert() {
  const { isDismissed, dismiss } = useDismissedAlerts()

  if (isDismissed(alertId)) {
    return null
  }

  return (
    <div
      role="alert"
      className={clsx(styles.alert, styles.info, styles.fullscreen)}
    >
      <Info aria-hidden />
      <span lang="fr">
        Vous êtes sur une instance de développement de Stylo.
      </span>
      <DismissAlertButton onClick={() => dismiss(alertId)} />
    </div>
  )
}
