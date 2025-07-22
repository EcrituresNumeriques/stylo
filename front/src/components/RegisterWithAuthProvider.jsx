import React, { useCallback } from 'react'
import { Helmet } from 'react-helmet'
import { Trans, useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { toast } from 'react-toastify'

import { useGraphQLClient } from '../helpers/graphQL'
import Button from './Button'
import Field from './Field'

import { fromFormData } from '../helpers/forms.js'

import * as queries from './Credentials.graphql'

import formStyles from './form.module.scss'
import styles from './login.module.scss'

export default function RegisterWithAuthProvider() {
  const { t } = useTranslation()
  const { service } = useParams()
  const navigate = useNavigate()
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
      toast(t('credentials.register.successToast'), {
        type: 'info',
      })

      navigate('/articles')
    } catch (err) {
      toast(t('credentials.register.errorToast', { message: err.message }), {
        type: 'error',
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

        <ul className={styles.actions}>
          <li>
            <Button primary={true} type="submit">
              {t('credentials.login.registerLink')}
            </Button>
          </li>
          <li>
            <Link to="/">{t('credentials.login.goBackLink')}</Link>
          </li>
        </ul>
      </form>
    </section>
  )
}
