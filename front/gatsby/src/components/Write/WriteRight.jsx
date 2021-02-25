import React, { useState } from 'react'

import styles from './writeRight.module.scss'
import YamlEditor from './yamleditor/YamlEditor'
import YAML from 'js-yaml'

export default (props) => {
  const [expanded, setExpanded] = useState(false)
  const [selector, setSelector] = useState('basic')
  const [rawYaml, setRawYaml] = useState(props.yaml)
  const [error, setError] = useState('')

  return (
    <nav className={`${expanded ? styles.expandRight : styles.retractRight}`}>
      <nav
        onClick={() => setExpanded(!expanded)}
        className={expanded ? styles.close : styles.open}
      >
        {expanded ? 'close' : 'Metadata'}
      </nav>
      {expanded && (
        <>
          <div className={styles.yamlEditor}>
            <header>
              <h1>Metadata</h1>
            </header>
            <nav>
              <p
                className={selector === 'basic' ? styles.selected : null}
                onClick={(e) => setSelector('basic')}
              >
                Basic Mode
              </p>
              <p
                className={selector === 'editor' ? styles.selected : null}
                onClick={(e) => setSelector('editor')}
              >
                Editor Mode
              </p>
              <p
                className={selector === 'raw' ? styles.selected : null}
                onClick={(e) => setSelector('raw')}
              >
                Raw Mode
              </p>
            </nav>
            {selector === 'raw' && (
              <>
                {error !== '' && <p className={styles.error}>{error}</p>}
                <textarea
                  value={rawYaml}
                  onChange={(event) => {
                    const component = event.target
                    const yaml = component.value
                    try {
                      YAML.loadAll(yaml)
                      setError('')
                      props.handleYaml(yaml)
                    } catch (err) {
                      setError(err.message)
                    } finally {
                      setRawYaml(yaml)
                    }
                  }}
                />
              </>
            )}
            {selector !== 'raw' && props.readOnly && (
              <YamlEditor
                yaml={props.yaml}
                basicMode={selector === 'basic'}
                error={(reason) => {
                  setError(reason)
                  if (reason !== '') {
                    setSelector('raw')
                  }
                }}
              />
            )}
            {selector !== 'raw' && !props.readOnly && (
              <YamlEditor
                yaml={props.yaml}
                basicMode={selector === 'basic'}
                error={(reason) => {
                  setError(reason)
                  if (reason !== '') {
                    setSelector('raw')
                  }
                }}
                onChange={(yaml) => {
                  setRawYaml(yaml)
                  props.handleYaml(yaml)
                }}
              />
            )}
          </div>
        </>
      )}
    </nav>
  )
}
