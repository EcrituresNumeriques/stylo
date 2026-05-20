import { AlertCircle, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { VALIDATOR_PROFILE_DEFS } from '../../../helpers/validator/index.js'
import { Alert, Loading } from '../../molecules/index.js'

import styles from './EditorValidation.module.scss'

export default function EditorValidation({
  diagnostics,
  isValidating,
  hasValidated,
  enabledProfiles = [],
  onProfileToggle,
  onNavigate,
}) {
  const { t } = useTranslation('editor')

  const errorCount = diagnostics.filter((d) => d.severity === 'error').length
  const warningCount = diagnostics.filter(
    (d) => d.severity === 'warning'
  ).length
  const isRefreshing = isValidating && hasValidated

  return (
    <div className={styles.container}>
      <header>
        <h2 className={styles.title}>{t('validation.title')}</h2>
      </header>

      <section className={styles.profilesSection}>
        <h3 className={styles.sectionTitle}>{t('validation.profiles')}</h3>
        <div className={styles.profiles}>
          {VALIDATOR_PROFILE_DEFS.map(({ id, labelKey }) => (
            <label key={id} className={styles.profileLabel}>
              <input
                type="checkbox"
                checked={enabledProfiles.includes(id)}
                onChange={() => onProfileToggle?.(id)}
              />
              {t(labelKey)}
            </label>
          ))}
        </div>
      </section>

      {enabledProfiles.length === 0 && (
        <Alert type="info" message={t('validation.noProfile')} />
      )}

      {isValidating && !hasValidated && <Loading label="validation.running" />}

      {isRefreshing && <Loading size="0.85rem" label="validation.refreshing" />}

      {!isRefreshing &&
        !isValidating &&
        hasValidated &&
        diagnostics.length === 0 && (
          <Alert type="success" message={t('validation.success')} />
        )}

      {!isRefreshing && hasValidated && diagnostics.length > 0 && (
        <>
          {errorCount > 0 && (
            <Alert
              type="error"
              message={t('validation.errorSummary', { count: errorCount })}
            />
          )}
          {warningCount > 0 && (
            <Alert
              type="warning"
              message={t('validation.warningSummary', { count: warningCount })}
            />
          )}

          <ul className={styles.diagnosticList}>
            {diagnostics.map((d, i) => (
              <li
                key={i}
                className={styles[d.severity]}
                onClick={() => onNavigate?.(d.line, d.column)}
                title={t('validation.navigateTo', { line: d.line })}
              >
                <span className={styles.icon}>
                  {d.severity === 'error' ? (
                    <AlertCircle size={14} />
                  ) : (
                    <AlertTriangle size={14} />
                  )}
                </span>
                <span className={styles.message}>{d.message}</span>
                <span className={styles.location}>
                  {t('validation.line')} {d.line}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
