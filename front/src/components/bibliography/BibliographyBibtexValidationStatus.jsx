import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Alert from '../molecules/Alert.jsx'
import Loading from '../molecules/Loading.jsx'

import styles from './BibliographyBibtexValidationStatus.module.scss'

export default function BibliographyBibtexValidationStatus({
  isLoading,
  errors,
  warnings,
  references,
  readOnly,
}) {
  const { t } = useTranslation()
  const referencesCount = Object.keys(references).length

  const component = (element) => {
    return <div className={styles.container}>{element}</div>
  }

  if (isLoading) {
    return component(<Loading label={t('validating.label')} />)
  }

  if (readOnly) {
    return component(
      <Alert
        type={referencesCount === 0 ? 'info' : 'success'}
        message={t('bibliography.readonly.references', {
          count: referencesCount,
        })}
      />
    )
  }

  if (errors.length > 0) {
    return component(
      <Alert
        type={'error'}
        message={
          <Trans i18nKey="bibliography.errors" count={errors.length}>
            Thereʼs a syntax error in your BibTeX.
            <span className={styles.cause}>Unable to save.</span>.
          </Trans>
        }
      />
    )
  }

  if (warnings.length > 0) {
    return component(
      <Alert
        type={'warning'}
        message={
          <Trans i18nKey="bibliography.warnings" count={errors.length}>
            Thereʼs a warning in your BibTeX.
            <span className={styles.cause}>Unable to save.</span>.
          </Trans>
        }
      />
    )
  }

  return component(
    <Alert
      type={referencesCount === 0 ? 'info' : 'success'}
      message={t('bibliography.references', {
        count: referencesCount,
      })}
    />
  )
}
