import React, { useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import YAML from 'js-yaml'
import { Sidebar } from 'react-feather'

import { toYaml } from './metadata/yaml.js'
import ArticleEditorMetadataForm from './yamleditor/ArticleEditorMetadataForm.jsx'
import NavTag from '../NavTab'
import MonacoYamlEditor from './providers/monaco/YamlEditor'

import styles from './articleEditorMetadata.module.scss'

export default function ArticleEditorMetadata ({ onChange, readOnly, metadata }) {
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

  const handleFormUpdate = useCallback((metadata) => {
    if (readOnly) {
      return
    }
    setRawYaml(toYaml(metadata))
    onChange(metadata)
  }, [readOnly, setRawYaml, onChange])

  const handleRawYamlChange = useCallback((yaml) => {
    try {
      const [metadata = {}] = YAML.loadAll(yaml)
      setError('')
      onChange(metadata)
    } catch (err) {
      setError(err.message)
    } finally {
      setRawYaml(yaml)
    }
  }, [setRawYaml])

  return (
    <nav className={`${expanded ? styles.expandRight : styles.retractRight}`}>
      <button
        onClick={toggleExpand}
        className={expanded ? styles.close : styles.open}
      >
        <Sidebar/> {expanded ? t('write.sidebar.closeButton') : t('write.sidebar.metadataButton')}
      </button>
      {expanded && (
        <div className={styles.yamlEditor}>
          <NavTag
            defaultValue={selector}
            onChange={setSelector}
            items={[
              {
                value: 'basic',
                name: t('write.basicMode.metadataButton'),
              },
              {
                value: 'raw',
                name: t('write.rawMode.metadataButton'),
              },
            ]}
          />
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
      )}
    </nav>
  )
}

ArticleEditorMetadata.propTypes = {
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  metadata: PropTypes.object,
}
