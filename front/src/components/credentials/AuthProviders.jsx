import React from 'react'
import { useTranslation } from 'react-i18next'

import { useSetAuthToken } from '../../hooks/user.js'

import styles from '../credentials.module.scss'
import Button from '../Button.jsx'

export function AuthProvider({ service }) {
  const { t } = useTranslation()

  const { link, unlink, isLinked, error } = useSetAuthToken(service)

  return (
    <div className={styles.authProvider}>
      <h3>{t(`credentials.authentication.service.${service}`)}</h3>

      <div>
        <p>
          {t('credentials.authentication.service.description', {
            context: service,
          })}
        </p>

        <Button onClick={isLinked ? unlink : link} type="button">
          {t('credentials.authentication.linkServiceButton', {
            context: isLinked ? 'linked' : 'unlinked',
          })}
        </Button>
      </div>
    </div>
  )
}

export default function AuthProviders() {
  const { t } = useTranslation()

  return (
    <section className={styles.section}>
      <h2>{t('user.authProviders.title')}</h2>

      <AuthProvider service="humanid" />
      <AuthProvider service="hypothesis" />
      <AuthProvider service="zotero" />
    </section>
  )
}
