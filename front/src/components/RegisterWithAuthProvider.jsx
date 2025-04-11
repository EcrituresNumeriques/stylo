import React, { useCallback } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link, useHistory, useLocation, useParams } from 'react-router-dom'
import { useToasts } from '@geist-ui/core'
import { useGraphQLClient } from '../helpers/graphQL'
import * as queries from './Credentials.graphql'

import styles from './login.module.scss'
import formStyles from './form.module.scss'
import Field from './Field'
import Button from './Button'

import { fromFormData } from '../helpers/forms.js'
import { Helmet } from 'react-helmet'
import { useDispatch } from 'react-redux'

export default function RegisterWithAuthProvider() {
  const { t } = useTranslation()
  const { setToast } = useToasts()
  const { service } = useParams()
  const history = useHistory()
  const dispatch = useDispatch()
  const { search } = useLocation()
  const { query } = useGraphQLClient()
  const params = new URLSearchParams(search)

  const serviceLabel = t(`credentials.authentication.service.${service}`)

  const handleFormSubmit = useCallback(async (event) => {
    event.preventDefault()
    const details = fromFormData(event.target)

    try {
      const { createUserWithAuth: token } = await query({
        query: queries.createUserWithAuth,
        variables: { details, service },
        // needed to link the session to the http request in the resolver
        withCredentials: true,
      })

      dispatch({ type: 'UPDATE_SESSION_TOKEN', token })

      // if no error thrown, we can navigate to /
      setToast({
        type: 'default',
        text: t('credentials.register.successToast'),
      })

      history.push('/articles')
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
        aria-describedby="register-with-auth-description"
        aria-labelledby="register-with-auth-title"
      >
        <h1 id="register-with-auth-title">
          {t('credentials.registerWithAuth.title')}
        </h1>

        <p id="register-with-auth-description">
          <Trans
            i18nKey="credentials.registerWithAuth.description"
            value={{ serviceLabel }}
          >
            Please complete the following information to finish creating a Stylo
            account linked to {{ serviceLabel }}. If you already have a Stylo
            account, <Link to="/login">log in</Link>
            with your credentials and then link the {{ serviceLabel }} service
            from your account settings.
          </Trans>
        </p>

        <Field
          name="displayName"
          label={t('user.account.displayName')}
          defaultValue={params.get('name')}
          mandatory
        />
        <Field name="firstName" label={t('user.account.firstName')} />
        <Field name="lastName" label={t('user.account.lastName')} />
        <Field name="institution" label={t('user.account.institution')} />

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
