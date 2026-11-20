import clsx from 'clsx'
import { useCallback, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

import { fromFormData } from '../../../helpers/forms.js'
import { useGraphQLClient } from '../../../helpers/graphQL.js'
import {
  setWebdavAccount,
  unsetWebdavAccount,
} from '../../../hooks/Credentials.graphql'
import buttonStyles from '../../atoms/Button.module.scss'
import { Button, Field } from '../../atoms/index.js'

import styles from './UserSection.module.scss'

export function WebdavAccount() {
  const { t } = useTranslation('credentials', { useSuspense: false })
  const dispatch = useDispatch()
  const { query } = useGraphQLClient()
  const account = useSelector((state) => state.activeUser.authProviders?.webdav)
  const [isSaving, setIsSaving] = useState(false)

  const save = useCallback(
    async (event) => {
      event.preventDefault()
      setIsSaving(true)
      try {
        const result = account
          ? await query({ query: unsetWebdavAccount })
          : await query({
              query: setWebdavAccount,
              variables: { input: fromFormData(event.target) },
            })
        const { authProviders } =
          result.setWebdavAccount ?? result.unsetWebdavAccount
        dispatch({
          type: 'UPDATE_ACTIVE_USER_DETAILS',
          payload: { authProviders },
        })
      } catch (error) {
        toast(t('webdav.saveError', { errMessage: error.message }), {
          type: 'error',
        })
      } finally {
        setIsSaving(false)
      }
    },
    [account, query]
  )

  return (
    <div>
      <form onSubmit={save} className={styles.form}>
        <p>
          {account ? (
            <Trans
              t={t}
              i18nKey="webdav.linked"
              values={account}
              components={{ code: <code /> }}
            />
          ) : (
            t('webdav.description')
          )}
        </p>

        {!account && (
          <>
            <Field
              name="url"
              label={t('webdav.url')}
              type="url"
              placeholder="https://sharedocs.huma-num.fr/dav.php/"
              required
            />
            <Field
              name="username"
              label={t('webdav.username')}
              type="text"
              autoComplete="off"
              required
            />
            <Field
              name="password"
              label={t('webdav.password')}
              type="password"
              autoComplete="new-password"
              required
            />
          </>
        )}

        <div>
          {account?.kind && account.webUrl && (
            <>
              <a
                className={clsx(buttonStyles.button, buttonStyles.primary)}
                href={account.webUrl}
                target="_blank"
                rel="noreferrer"
              >
                {t('webdav.browse')}
              </a>{' '}
            </>
          )}
          <Button type="submit" disabled={isSaving}>
            {t(account ? 'webdav.remove' : 'webdav.save')}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function ExternalStorage() {
  const { t } = useTranslation('credentials', { useSuspense: false })

  return (
    <section className={styles.section} id="external-storage">
      <h2>{t('externalStorage.title')}</h2>

      <WebdavAccount />
    </section>
  )
}
