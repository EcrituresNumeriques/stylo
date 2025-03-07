import { Toggle } from '@geist-ui/core'
import React, { useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import YAML from 'js-yaml'
import Sidebar from '../Sidebar.jsx'

import { toYaml } from './metadata/yaml.js'
import ArticleEditorMetadataForm from './yamleditor/ArticleEditorMetadataForm.jsx'
import MonacoYamlEditor from './providers/monaco/YamlEditor'

import styles from './articleEditorMetadata.module.scss'

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
    <Sidebar
      labelClosed={'Métadonnées'}
      opened={expanded}
      setOpened={toggleExpand}
    >
      <div className={styles.metadata}>
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
                console.log(e)
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
              height="calc(100vh - 280px)"
              fontSize="14"
              text={rawYaml}
              onTextUpdate={handleRawYamlChange}
            />
          </>
        )}
        {selector !== 'raw' && (
          <ArticleEditorMetadataForm
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
    </Sidebar>
  )
}

ArticleEditorMetadata.propTypes = {
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  metadata: PropTypes.object,
}
