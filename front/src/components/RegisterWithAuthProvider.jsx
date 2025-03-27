import React, { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useHistory } from 'react-router-dom'
import { useToasts } from '@geist-ui/core'
import { useGraphQLClient } from '../helpers/graphQL'
import * as queries from './Credentials.graphql'

import styles from './login.module.scss'
import formStyles from './form.module.scss'
import Field from './Field'
import Button from './Button'

import { fromFormData } from '../helpers/forms.js'
import { Helmet } from 'react-helmet'

export default function RegisterWithAuthProvider() {
  const { t } = useTranslation()
  const { setToast } = useToasts()
  const history = useHistory()
  const { query } = useGraphQLClient()

  const handleFormSubmit = useCallback(async (event) => {
    event.preventDefault()
    const details = fromFormData(event.target)

    try {
      await query({ query: queries.createUserWithAuth, variables: { details } })
      // if no error thrown, we can navigate to /
      setToast({
        type: 'default',
        text: t('credentials.register.successToast'),
      })
      history.push('/')
    } catch (err) {
      setToast({
        type: 'error',
        text: t('credentials.register.errorToast', { message: err.message }),
      })
    }
  }, [])

  return (
    <section className={styles.box}>
      <Helmet>
        <title>{t('credentials.registerWithAuth.title')}</title>
      </Helmet>

      <form
        onSubmit={handleFormSubmit}
        id="form-register"
        className={formStyles.form}
      >
        <h1>{t('credentials.registerWithAuth.title')}</h1>

        <fieldset className={styles.section}>
          <Field name="displayName" label={t('user.account.displayName')} />
          <Field name="firstName" label={t('user.account.firstName')} />
          <Field name="lastName" label={t('user.account.lastName')} />
          <Field name="institution" label={t('user.account.institution')} />
        </fieldset>

        <ul>
          <li>
            <Button primary={true} type="submit">
              {t('credentials.registerWithAuth.submitButton')}
            </Button>
          </li>
          <li>
            <Link to="/login">
              {t('credentials.registerWithAuth.goBackLink')}
            </Link>
          </li>
        </ul>
      </form>
    </section>
  )
}
