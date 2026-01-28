import React, { useCallback, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { toast } from 'react-toastify'

import { fromFormData, validateSameFieldValue } from '../../../helpers/forms.js'
import { useGraphQLClient } from '../../../helpers/graphQL.js'
import { Button, Field } from '../../atoms/index.js'

import * as queries from '../../../hooks/Credentials.graphql'

import formStyles from '../../molecules/form.module.scss'
import styles from './pages/login.module.scss'

export default function Register() {
  const { t } = useTranslation()
  const passwordRef = useRef(null)
  const passwordConfirmationRef = useRef(null)
  const navigate = useNavigate()
  const { query } = useGraphQLClient()

  const handleFormSubmit = useCallback(async (event) => {
    event.preventDefault()
    const details = fromFormData(event.target)

    try {
      await query({ query: queries.createUser, variables: { details } })
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
        <title>{t('credentials.login.registerLink')}</title>
      </Helmet>

      <form
        onSubmit={handleFormSubmit}
        id="form-register"
        className={formStyles.form}
        aria-labelledby="form-register-title"
      >
        <h1 id="form-register-title">{t('credentials.register.title')}</h1>

        <fieldset
          className={styles.section}
          aria-labelledby="form-register-s1-title"
        >
          <legend>
            <h2 id="form-register-s1-title">
              {t('credentials.register.requiredFields')}
            </h2>
          </legend>

          <Field
            name="email"
            type="email"
            label={t('user.account.email')}
            autoComplete="email"
            autoFocus={true}
            required={true}
          />
          <Field
            name="username"
            label={t('user.account.username')}
            autoComplete="username"
            required={true}
          />
          <Field
            ref={passwordRef}
            name="password"
            type="password"
            label={t('credentials.password.label')}
            minLength={6}
            autoComplete="new-password"
            onChange={validateSameFieldValue(
              passwordConfirmationRef,
              passwordRef,
              t('credentials.password.mismatch')
            )}
            required={true}
          />
          <Field
            ref={passwordConfirmationRef}
            name="passwordC"
            type="password"
            minLength={6}
            label={t('credentials.confirmPassword.label')}
            autoComplete="new-password"
            onChange={validateSameFieldValue(
              passwordConfirmationRef,
              passwordRef,
              t('credentials.password.mismatch')
            )}
            required={true}
          />
        </fieldset>

        <fieldset
          className={styles.section}
          aria-labelledby="form-register-s2-title"
        >
          <legend>
            <h2 id="form-register-s2-title">
              {t('credentials.register.optionalFields')}
            </h2>
          </legend>

          <Field name="displayName" label={t('user.account.displayName')} />
          <Field name="firstName" label={t('user.account.firstName')} />
          <Field name="lastName" label={t('user.account.lastName')} />
          <Field name="institution" label={t('user.account.institution')} />
        </fieldset>

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
