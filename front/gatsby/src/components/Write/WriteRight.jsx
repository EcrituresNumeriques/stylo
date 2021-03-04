import React, { useState } from 'react'

import styles from './writeRight.module.scss'
import YamlEditor from './yamleditor/YamlEditor'
import NavTag from '../NavTab'
import YAML from 'js-yaml'
import Button from '../Button'

export default function WriteRight (props) {
  const [expanded, setExpanded] = useState(false)
  const [selector, setSelector] = useState('basic')
  const [rawYaml, setRawYaml] = useState(props.yaml)
  const [error, setError] = useState("")

  return (
    <nav className={`${expanded ? styles.expandRight : styles.retractRight}`}>
      <Button
        onClick={() => setExpanded(!expanded)}
        className={[styles.openCloseButton, expanded ? styles.openCloseButtonRetract : styles.openCloseButtonExpand].join(' ')}
      >
        {expanded ? 'close' : 'Metadata'}
      </Button>
      {expanded && (
        <div className={styles.yamlEditor}>
          <header className={styles.sidebarHeader}>
            <h1>Metadata</h1>

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
          </header>

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
      )}
    </nav>
  )
}
