import { Toggle } from '@geist-ui/core'
import YAML from 'js-yaml'
import { ArrowLeft } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useArticleMetadata } from '../../hooks/article.js'
import { usePreferenceItem } from '../../hooks/user.js'

import Alert from '../molecules/Alert.jsx'
import Loading from '../molecules/Loading.jsx'

import styles from './articleEditorMetadata.module.scss'
import { toYaml } from './metadata/yaml.js'
import MonacoYamlEditor from './providers/monaco/YamlEditor.jsx'
import ArticleEditorMetadataForm from './yamleditor/ArticleEditorMetadataForm.jsx'

/**
 * @param {object} props
 * @param {(object) => void} props.onBack
 * @param {string} props.articleId
 * @param {string} props.versionId
 * @returns {Element}
 */
export default function ArticleMetadata ({ onBack, articleId, versionId }) {
  /** @type {object} */
  const articleWriters = useSelector((state) => state.articleWriters || {})
  const multiUserActive = useMemo(
    () => Object.keys(articleWriters).length > 1,
    [articleWriters]
  )
  const readOnly = multiUserActive || versionId
  const { t } = useTranslation()
  const { metadata, isLoading, updateMetadata } = useArticleMetadata({ articleId, versionId })
  const yaml = useMemo(() => toYaml(metadata), [metadata])
  const [rawYaml, setRawYaml] = useState(yaml)
  const [error, setError] = useState('')

  const { value: selector, setValue: setSelector } = usePreferenceItem(
    'metadataFormMode',
    'article'
  )

  const handleFormUpdate = useCallback(
    async (metadata) => {
      if (readOnly) {
        return
      }
      setRawYaml(toYaml(metadata))
      await updateMetadata(metadata)
    },
    [readOnly, setRawYaml, updateMetadata]
  )

  const handleRawYamlChange = useCallback(
    async (yaml) => {
      try {
        const [metadata = {}] = YAML.loadAll(yaml)
        setError('')
        await updateMetadata(metadata)
      } catch (err) {
        setError(err.message)
      } finally {
        setRawYaml(yaml)
      }
    },
    [setRawYaml]
  )

  if (isLoading) {
    return <Loading/>
  }

  const title = onBack ? (
    <h2
      className={styles.title}
      onClick={onBack}
      style={{ cursor: 'pointer', userSelect: 'none' }}
    >
      <span onClick={onBack} style={{ display: 'flex' }}>
        <ArrowLeft style={{ strokeWidth: 3 }}/>
      </span>
      <span>{t('metadata.title')}</span>
    </h2>
  ) : (
    <h2 className={styles.title}>{t('metadata.title')}</h2>
  )

  return (
    <div className={styles.yamlEditor}>
      <header className={styles.header}>
        {title}
        <div
          className={styles.toggle}
          onClick={() => setSelector(selector === 'raw' ? 'basic' : 'raw')}
        >
          <Toggle
            id="raw-mode"
            checked={selector === 'raw'}
            title={t('metadata.showYaml')}
            onChange={(e) => {
              setSelector(e.target.checked ? 'raw' : 'basic')
            }}
          />
          <label htmlFor="raw-mode">YAML</label>
        </div>
      </header>
      {versionId && (
        <div className={styles.readonly}>
          <Alert message={t('metadata.readonly.versionView')} type="warning"/>
        </div>
      )}
      {!versionId && multiUserActive && (
        <div className={styles.readonly}>
          <Alert message={t('metadata.readonly.multiUserActive')} type="warning"/>
        </div>
      )}
      {selector === 'raw' && (
        <>
          {error !== '' && <p className={styles.error}>{error}</p>}
          <MonacoYamlEditor
            readOnly={readOnly}
            height="calc(100vh - 280px)"
            fontSize="14"
            text={rawYaml}
            onTextUpdate={handleRawYamlChange}
          />
        </>
      )}
      {selector !== 'raw' && (
        <ArticleEditorMetadataForm
          readOnly={readOnly}
          metadata={metadata}
          error={(reason) => {
            setError(reason)
            if (reason !== '') {
              setSelector('raw')
            }
          }}
          onChange={handleFormUpdate}
        />
      )}
    </div>
  )
}
