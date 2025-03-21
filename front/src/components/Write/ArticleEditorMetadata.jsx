import { Toggle } from '@geist-ui/core'
import React, { useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import YAML from 'js-yaml'
import { Sidebar } from 'react-feather'

import { toYaml } from './metadata/yaml.js'
import ArticleEditorMetadataForm from './yamleditor/ArticleEditorMetadataForm.jsx'
import MonacoYamlEditor from './providers/monaco/YamlEditor'

import styles from './articleEditorMetadata.module.scss'

/**
 * @param {object} props properties
 * @param {any} props.metadata
 * @param {boolean} props.readOnly
 * @param {(any) => void} props.onChange
 * @returns {Element}
 */
export default function ArticleEditorMetadata({
  onChange,
  readOnly,
  metadata,
}) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const expanded = useSelector(
    (state) => state.articlePreferences.expandSidebarRight
  )
  const selector = useSelector(
    (state) => state.articlePreferences.metadataFormMode
  )
  const yaml = useMemo(() => toYaml(metadata), [metadata])
  const [rawYaml, setRawYaml] = useState(yaml)
  const [error, setError] = useState('')

  const toggleExpand = useCallback(
    () =>
      dispatch({
        type: 'ARTICLE_PREFERENCES_TOGGLE',
        key: 'expandSidebarRight',
      }),
    []
  )
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

  return (
    <nav className={`${expanded ? styles.expandRight : styles.retractRight}`}>
      <button
        onClick={toggleExpand}
        className={expanded ? styles.close : styles.open}
      >
        <Sidebar />{' '}
        {expanded
          ? t('write.sidebar.closeButton')
          : t('write.sidebar.metadataButton')}
      </button>
      {expanded && (
        <div className={styles.yamlEditor}>
          <header className={styles.header}>
            <h2>Metadonnées</h2>
            <div
              className={styles.toggle}
              onClick={() => setSelector(selector === 'raw' ? 'basic' : 'raw')}
            >
              <Toggle
                id="raw-mode"
                checked={selector === 'raw'}
                title={'Activer le mode YAML'}
                onChange={(e) => {
                  setSelector(e.target.checked ? 'raw' : 'basic')
                }}
              />
              <label htmlFor="raw-mode">YAML</label>
            </div>
          </header>
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
      )}
    </nav>
  )
}
