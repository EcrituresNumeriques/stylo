import React, { useState } from 'react'

import styles from './writeRight.module.scss'
import YamlEditor from './yamleditor/YamlEditor'
import NavTag from '../NavTab'
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
            <NavTag defaultValue={selector} onChange={(value) => setSelector(value)} items={[
              {
                value: 'basic',
                name: 'Basic Mode'
              },
              {
                value: 'editor',
                name: 'Editor Mode'
              },
              {
                value: 'raw',
                name: 'Raw Mode'
              }
              ]
            }/>
            {selector === 'raw' && (
              <>
                {error !== '' && <p className={styles.error}>{error}</p>}
                <textarea
                  value={rawYaml}
                  rows={20}
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
