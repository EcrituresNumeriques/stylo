import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

import styles from './edit.module.scss'
import buttonStyles from './../button.module.scss'
import formStyles from './../field.module.scss'

import etv from '../../helpers/eventTargetValue'
import formatTimeAgo from '../../helpers/formatTimeAgo'

import Modal from '../Modal'
import Export from '../Export'
import Button from '../Button'
import Field from '../Field'

import { ChevronDown, ChevronRight } from 'react-feather'


const mapStateToProps = ({ applicationConfig }) => {
  return { applicationConfig }
}

// composant minimum
const Edit = (props) => {
  //Default if live
  let expVar = {
    article: true,
    _id: props.article._id,
    title: props.article.title,
    versionId: props.versions[0]._id,
    version: props.versions[0].version,
    revision: props.versions[0].revision,
  }
  //if not live, set the export variable
  if (props.readOnly) {
    expVar = {
      ...expVar,
      article: false,
      _id: props._id,
      versionId: props._id,
      version: props.version,
      revision: props.revision,
    }
  }

  const [expand, setExpand] = useState(true)
  const [message, setMessage] = useState('')
  const [savedAgo, setSavedAgo] = useState(
    formatTimeAgo(new Date(props.versions[0].updatedAt))
  )
  const [exporting, setExporting] = useState(false)
  const [exportVar, setExportVar] = useState(expVar)

  const saveVersion = async (e, major = false) => {
    e.preventDefault()
    await props.sendVersion(false, major, message)
    //const newVersion = await props.sendVersion(false,major, message)
    setMessage('')
    //setVersions([newVersion.saveVersion,...versions])
  }

  useEffect(() => {
    const timerID = setInterval(() => tick(props.versions[0].updatedAt), 1000)
    return function cleanup() {
      clearInterval(timerID)
    }
  }, [props.versions])

  function tick(date) {
    setSavedAgo(formatTimeAgo(new Date(date)))
  }

  return (
    <section id={styles.section}>
      {exporting && (
        <Modal cancel={() => setExporting(false)}>
          <Export {...exportVar} />
        </Modal>
      )}
      <h1
        className={expand ? null : styles.closed}
        onClick={() => setExpand(!expand)}
      >
        {expand ? <ChevronDown/> : <ChevronRight/>} Edition
      </h1>
      {expand && (
        <>
          {props.readOnly && (
            <li key={`showVersion-GoLive`}>
              <Link to={`/article/${props.article._id}`}>Edit</Link>
            </li>
          )}
          {!props.readOnly && (
            <nav>
              <Button
                onClick={() => {
                  setExportVar({
                    ...exportVar,
                    article: true,
                    _id: props.article._id,
                    versionId: props.versions[0]._id,
                    version: props.versions[0].version,
                    revision: props.versions[0].revision,
                  })
                  setExporting(true)
                }}
                className={styles.button}
              >
                Export
              </Button>
              <a
                href={`https://via.hypothes.is/${props.applicationConfig.exportEndpoint}/api/v1/htmlArticle/${props.article._id}?preview=true`}
                target="_blank"
                rel="noopener noreferrer"
                className={[buttonStyles.button, buttonStyles.secondary].join(' ')}
              >
                preview
              </a>
            </nav>
          )}
          {!props.readOnly && <p>Edition - Last save: {savedAgo}</p>}

          {!props.readOnly && (
            <form
              className=""
              onSubmit={(e) => saveVersion(e, false)}
            >
              <Field
                placeholder="Label of the version"
                value={message}
                onChange={(e) => setMessage(etv(e))}
              />
              <Button onClick={(e) => saveVersion(e, false)}>Save Minor</Button>
              <Button onClick={(e) => saveVersion(e, true)}>Save Major</Button>
            </form>
          )}
        </>
      )}
    </section>
  )
}

export default connect(mapStateToProps)(Edit)
