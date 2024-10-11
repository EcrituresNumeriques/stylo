import React, {useCallback, useMemo, useState} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'

import styles from './articleEditorMetadata.module.scss'
import YamlEditor from './yamleditor/YamlEditor'
import NavTag from '../NavTab'
import YAML from 'js-yaml'
import MonacoYamlEditor from './providers/monaco/YamlEditor'
import { Sidebar } from 'react-feather'
import MetadataForm from "../metadata/MetadataForm.jsx";

export default function ArticleEditorMetadata({ handleYaml, readOnly, yaml }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const expanded = useSelector(
    (state) => state.articlePreferences.expandSidebarRight
  )
  const selector = useSelector(
    (state) => state.articlePreferences.metadataFormMode
  )

  const [rawYaml, setRawYaml] = useState(yaml)
  const [error, setError] = useState('')

  const data = useMemo(() =>  YAML.loadAll(rawYaml)[0] || {}, [rawYaml])

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

  const handleRawYamlChange = useCallback((yaml) => {
    try {
      YAML.loadAll(yaml)
      setError('')
      handleYaml(yaml)
    } catch (err) {
      setError(err.message)
    } finally {
      setRawYaml(yaml)
    }
  }, [yaml])

  return (
    <nav className={`${expanded ? styles.expandRight : styles.retractRight}`}>
      <button
        onClick={toggleExpand}
        className={expanded ? styles.close : styles.open}
      >
        <Sidebar /> {expanded ? t('write.sidebar.closeButton') : t('write.sidebar.metadataButton')}
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
                value: 'editor',
                name: t('write.editorMode.metadataButton'),
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
          {selector !== 'raw' && readOnly && (
            <YamlEditor
              yaml={rawYaml}
              basicMode={selector === 'basic'}
              error={(reason) => {
                setError(reason)
                if (reason !== '') {
                  setSelector('raw')
                }
              }}
            />
          )}
          {selector !== 'raw' && !readOnly && (
            <MetadataForm
              data={data}
              templates={selector === 'basic' ? ['basic'] : ['']}
              onChange={(yaml) => {
                setRawYaml(yaml)
                handleYaml(yaml)
              }}
            />
          )}
        </div>
      )}
    </nav>
  )
}

ArticleEditorMetadata.propTypes = {
  handleYaml: PropTypes.func,
  readOnly: PropTypes.bool,
  yaml: PropTypes.string,
}
