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
import { ArrowLeftCircle, Check } from 'lucide-react'
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
      >
        <h1>{t('credentials.register.title')}</h1>

        <fieldset className={styles.section}>
          <legend>
            <h2>{t('credentials.register.requiredFields')}</h2>
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
            label={t('credentials.password.placeholder')}
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
            label={t('credentials.confirmNewPassword.placeholder')}
            autoComplete="new-password"
            onChange={validateSameFieldValue(
              passwordConfirmationRef,
              passwordRef,
              t('credentials.password.mismatch')
            )}
            required={true}
          />
        </fieldset>

        <fieldset className={styles.section}>
          <legend>
            <h2>{t('credentials.register.optionalFields')}</h2>
          </legend>

          <Field name="displayName" label={t('user.account.displayName')} />
          <Field name="firstName" label={t('user.account.firstName')} />
          <Field name="lastName" label={t('user.account.lastName')} />
          <Field name="institution" label={t('user.account.institution')} />
        </fieldset>

        <ul className={styles.actions}>
          <li>
            <Link to="/">
              <ArrowLeftCircle className={styles.inlineIcon} size={20} />
              {t('credentials.login.goBackLink')}
            </Link>
          </li>
          <li className={styles.actionsSubmit}>
            <Button primary={true} type="submit">
              <Check role="presentation" />
              {t('credentials.login.registerLink')}
            </Button>
          </li>
        </ul>
      </form>
    </section>
  )
}
