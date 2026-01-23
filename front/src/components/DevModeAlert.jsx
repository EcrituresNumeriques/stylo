import clsx from 'clsx'
import { Info } from 'lucide-react'
import React from 'react'

import styles from './molecules/Alert.module.scss'

export default function DevModeAlert() {
  return (
    <div
      role="alert"
      className={clsx(styles.alert, styles.info, styles.fullscreen)}
      lang="fr"
    >
      <Info aria-hidden />
      Vous êtes sur une instance de développement de Stylo.
    </div>
  )
}
