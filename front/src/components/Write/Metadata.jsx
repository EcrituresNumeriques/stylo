import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import styles from './metadata.module.scss'
import YamlEditor from './yamleditor/YamlEditor'
import NavTag from '../NavTab'
import YAML from 'js-yaml'
import menuStyles from "./menu.module.scss";
import { ChevronDown, ChevronRight } from "react-feather";

export default function Metadata({ handleYaml, readOnly, yaml }) {
  const dispatch = useDispatch()

  const metadataFormMode = useSelector(state => state.articlePreferences.metadataFormMode)
  const expand = useSelector(state => state.articlePreferences.expandMetadata)
  const toggleExpand = useCallback(() => dispatch({ type: 'ARTICLE_PREFERENCES_TOGGLE', key: 'expandMetadata' }), [])

  const [rawYaml, setRawYaml] = useState(yaml)
  const [error, setError] = useState('')

  const setMetadataFormMode = useCallback(
    (value) =>
      dispatch({
        type: 'ARTICLE_PREFERENCES_TOGGLE',
        key: 'metadataFormMode',
        value,
      }),
    []
  )

  return (
    <section className={[styles.section, menuStyles.section].join(' ')}>
      <h1 onClick={toggleExpand}>
        {expand ? <ChevronDown/> : <ChevronRight/>} Metadata
      </h1>
      {expand && (
        <>
          <div className={styles.yamlEditor}>
            <NavTag
              defaultValue={metadataFormMode}
              onChange={setMetadataFormMode}
              items={[
                {
                  value: 'basic',
                  name: 'Basic Mode',
                },
                {
                  value: 'editor',
                  name: 'Editor Mode',
                },
                {
                  value: 'raw',
                  name: 'Raw Mode',
                },
              ]}
            />
            {metadataFormMode === 'raw' && (
              <>
                {error !== '' && <p className={styles.error}>{error}</p>}
                <textarea
                  className={styles.rawYaml}
                  value={rawYaml}
                  wrap="off"
                  rows={20}
                  onChange={(event) => {
                    const component = event.target
                    const yaml = component.value
                    try {
                      YAML.loadAll(yaml)
                      setError('')
                      handleYaml(yaml)
                    } catch (err) {
                      setError(err.message)
                    } finally {
                      setRawYaml(yaml)
                    }
                  }}
                />
              </>
            )}
            {metadataFormMode !== 'raw' && readOnly && (
              <YamlEditor
                yaml={yaml}
                basicMode={metadataFormMode === 'basic'}
                error={(reason) => {
                  setError(reason)
                  if (reason !== '') {
                    setMetadataFormMode('raw')
                  }
                }}
              />
            )}
            {metadataFormMode !== 'raw' && !readOnly && (
              <YamlEditor
                yaml={yaml}
                basicMode={metadataFormMode === 'basic'}
                error={(reason) => {
                  setError(reason)
                  if (reason !== '') {
                    setMetadataFormMode('raw')
                  }
                }}
                onChange={(yaml) => {
                  setRawYaml(yaml)
                  handleYaml(yaml)
                }}
              />
            )}
          </div>
        </>
      )}
    </section>
  )
}

Metadata.propTypes = {
  handleYaml: PropTypes.func,
  readOnly: PropTypes.bool,
  yaml: PropTypes.string,
}
