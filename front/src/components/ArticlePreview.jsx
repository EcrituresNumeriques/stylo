import React, { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { applicationConfig } from '../stores/applicationConfig.jsx'

import styles from './articles.module.scss'
import Loading from './Loading'

export default function ArticlePreview() {
  const { id, version, bookId } = useParams()
  const { exportEndpoint } = applicationConfig
  const [isLoaded, setLoaded] = useState(false)
  const previewFrame = useRef()

  const url = bookId
    ? `${exportEndpoint}/api/v1/htmlBook/${bookId}?preview=true`
    : version
      ? `${exportEndpoint}/api/v1/htmlVersion/${version}?preview=true`
      : `${exportEndpoint}/api/v1/htmlArticle/${id}?preview=true`

  useEffect(() => {
    previewFrame.current.addEventListener('load', () => setLoaded(true))
  }, [])

  return (
    <>
      {!isLoaded && <Loading />}

      <iframe
        className={styles.previewContainer}
        ref={previewFrame}
        hidden={!isLoaded}
        src={url}
      />
    </>
  )
}
