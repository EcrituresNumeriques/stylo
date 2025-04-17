import React, { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useHistory } from 'react-router-dom'
import { useToasts } from '@geist-ui/core'
import { useGraphQLClient } from '../helpers/graphQL'
import * as queries from './Credentials.graphql'
import { useActiveUserId } from '../hooks/user.js'

import styles from './login.module.scss'
import formStyles from './form.module.scss'
import Field from './Field'
import Button from './Button'
import { fromFormData, validateSameFieldValue } from '../helpers/forms.js'
import { Helmet } from 'react-helmet'

export default function Register() {
  const { t } = useTranslation()
  const { setToast } = useToasts()
  const userId = useActiveUserId()
  const passwordRef = useRef()
  const passwordConfirmationRef = useRef()
  const history = useHistory()
  const { query } = useGraphQLClient()

  useEffect(() => {
    if (userId) {
      history.replace('/articles')
    }
  }, [userId])

  const handleFormSubmit = useCallback(async (event) => {
    event.preventDefault()
    const details = fromFormData(event.target)

    try {
      await query({ query: queries.createUser, variables: { details } })
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
