import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { useSetAuthToken } from '../../hooks/user.js'

import styles from '../credentials.module.scss'
import Button from '../Button.jsx'
import Field from '../Field.jsx'

export default function AuthProviders() {
  const { t } = useTranslation()

  const zoteroToken = useSelector(
    (state) => state.activeUser.authProviders?.zotero?.token
  )

  const { link: linkZoteroAccount, unlink: unlinkZoteroAccount } =
    useSetAuthToken('zotero')

  return (
    <section className={styles.section}>
      <h2>{t('user.authProviders.title')}</h2>

      <p>{t('user.authProviders.description')}</p>

      <Field label="Zotero">
        <>
          {zoteroToken && (
            <div className={styles.zotero}>
              <p>
                {t('credentials.authentication.linkedService.description', {
                  service: 'Zotero',
                })}
              </p>
              <Button
                onClick={unlinkZoteroAccount}
                type="button"
                aria-label={t('credentials.authentication.unlinkLabel', {
                  service: 'zotero',
                })}
              >
                {t('credentials.authentication.unlinkButton')}
              </Button>
            </div>
          )}
          {!zoteroToken && (
            <div className={styles.zotero}>
              <p>
                {t('credentials.authentication.unlinkedService.description')}
              </p>

              <Button
                onClick={linkZoteroAccount}
                type="button"
                aria-label={t('credentials.authentication.linkLabel', {
                  service: 'zotero',
                })}
              >
                {t('credentials.authentication.linkButton')}
              </Button>
            </div>
          )}
        </>
      </Field>
    </section>
  )
}
