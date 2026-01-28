import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Loading } from '../molecules/index.js'

export default function Unauthorized() {
  // REMIND: can't use `Suspense` inside an ErrorBoundary component
  const { t, _, ready } = useTranslation('errors', { useSuspense: false })
  if (!ready) {
    return <Loading />
  }
  return (
    <>
      <h2>{t('401.title')}</h2>
      <p>
        <Trans i18nKey="401.message" t={t}>
          Protected page <Link to="/login">authenticate</Link>.
        </Trans>
      </p>
    </>
  )
}
