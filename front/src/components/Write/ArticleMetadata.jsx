import { Toggle } from '@geist-ui/core'
import YAML from 'js-yaml'
import React, { useCallback, useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import Alert from '../molecules/Alert.jsx'

import { toYaml } from './metadata/yaml.js'
import MonacoYamlEditor from './providers/monaco/YamlEditor'
import ArticleEditorMetadataForm from './yamleditor/ArticleEditorMetadataForm.jsx'

import styles from './articleEditorMetadata.module.scss'

/**
 * @param {object} props
 * @param {(object) => void} props.onChange
 * @param {(object) => void} props.onBack
 * @param {object} props.metadata
 * @returns {Element}
 */
export default function ArticleMetadata({ onChange, onBack, metadata }) {
  /** @type {object} */
  const articleWriters = useSelector((state) => state.articleWriters || {})
  const readOnly = useMemo(
    () => Object.keys(articleWriters).length > 1,
    [articleWriters]
  )
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const selector = useSelector(
    (state) => state.articlePreferences.metadataFormMode
  )
  const yaml = useMemo(() => toYaml(metadata), [metadata])
  const [rawYaml, setRawYaml] = useState(yaml)
  const [error, setError] = useState('')

  const setSelector = useCallback(
    (value) =>
      dispatch({
        type: 'ARTICLE_PREFERENCES_TOGGLE',
        key: 'metadataFormMode',
        value,
      }),
    []
  )

  const handleFormUpdate = useCallback(
    (metadata) => {
      if (readOnly) {
        return
      }
      setRawYaml(toYaml(metadata))
      onChange(metadata)
    },
    [readOnly, setRawYaml, onChange]
  )

  const handleRawYamlChange = useCallback(
    (yaml) => {
      try {
        const [metadata = {}] = YAML.loadAll(yaml)
        setError('')
        onChange(metadata)
      } catch (err) {
        setError(err.message)
      } finally {
        setRawYaml(yaml)
      }
    },
    [setRawYaml]
  )

  const title = onBack ? (
    <h2
      className={styles.title}
      onClick={onBack}
      style={{ cursor: 'pointer', userSelect: 'none' }}
    >
      <span onClick={onBack} style={{ display: 'flex' }}>
        <ArrowLeft style={{ strokeWidth: 3 }} />
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
      {readOnly && (
        <div className={styles.readonly}>
          <Alert message={t('metadata.readonly')} type="warning" />
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
