import React from 'react'

import { useArticleVersion } from '../../hooks/article.js'
import i18n from '../../i18n.js'

import Alert from '../molecules/Alert.jsx'
import Loading from '../molecules/Loading.jsx'

export default function CollaborativeEditorActiveVersion({ versionId }) {
  const { version, isLoading, error } = useArticleVersion({ versionId })

  if (isLoading) {
    return <Loading />
  }

  if (error) {
    return <Alert versionId={error.message()} />
  }

  if (versionId && version) {
    const versionNumber = `${version.version}.${version.revision}`
    const versionCodename =
      version.message.trim().length > 0 ? `"${version.message}"` : null

    const versionDate = new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date(version.createdAt))
    return (
      <Alert
        type="info"
        message={`Vous êtes sur la version ${versionNumber}${
          versionCodename ? ` ${versionCodename}` : ''
        } du ${versionDate}`}
      ></Alert>
    )
  }

  return (
    <></>
  )
}
