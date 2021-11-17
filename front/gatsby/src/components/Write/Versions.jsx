import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import styles from './versions.module.scss'
import menuStyles from './menu.module.scss'
import buttonStyles from '../button.module.scss'

import Modal from '../Modal'
import Export from '../Export'
import { connect } from 'react-redux'

import { ChevronDown, ChevronRight, Save } from 'react-feather'
import Button from '../Button'
import Field from '../Field'
import etv from '../../helpers/eventTargetValue'
import formatTimeAgo from '../../helpers/formatTimeAgo'


Date.prototype.getUTCMinutesDoubleDigit = function () {
  if (this.getUTCMinutes() < 10) {
    return '0' + this.getUTCMinutes()
  }
  return this.getUTCMinutes()
}
Date.prototype.getUTCHoursDoubleDigit = function () {
  if (this.getUTCHours() < 10) {
    return '0' + this.getUTCHours()
  }
  return this.getUTCHours()
}
Date.prototype.getUTCMonthDoubleDigit = function () {
  if (this.getUTCMonth() + 1 < 9) {
    return '0' + Number(this.getUTCMonth() + 1)
  }
  return Number(this.getUTCMonth() + 1)
}
Date.prototype.getUTCDateDoubleDigit = function () {
  if (this.getUTCDate() < 10) {
    return '0' + this.getUTCDate()
  }
  return this.getUTCDate()
}

Date.prototype.formatMMDDYYYY = function () {
  return (
    this.getUTCHoursDoubleDigit() +
    ':' +
    this.getUTCMinutesDoubleDigit() +
    'utc ' +
    this.getUTCDateDoubleDigit() +
    '/' +
    this.getUTCMonthDoubleDigit() +
    '/' +
    this.getFullYear()
  )
}

const mapStateToProps = ({ applicationConfig }) => {
  return { applicationConfig }
}

const Versions = ({ article, versions, readOnly, version, revision, versionId, sendVersion, selectedVersion, compareTo }) => {
  //Default if live
  let expVar = {
    article: true,
    _id: article._id,
    title: article.title,
    versionId: versions[0]._id,
    version: versions[0].version,
    revision: versions[0].revision,
  }
  //if not live, set the export variable
  if (readOnly) {
    expVar = {
      ...expVar,
      article: false,
      _id: versionId,
      versionId: versionId,
      version: version,
      revision: revision,
    }
  }

  const [message, setMessage] = useState('')
  const [expand, setExpand] = useState(true)
  const [expandSaveForm, setExpandSaveForm] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportVar, setExportVar] = useState(expVar)
  const [savedAgo, setSavedAgo] = useState(
    formatTimeAgo(new Date(versions[0].updatedAt))
  )

  const saveVersion = async (e, major = false) => {
    e.preventDefault()
    await sendVersion(false, major, message)
    setMessage('')
    setExpandSaveForm(false)
  }

  const lastVersionId = versions[0]._id

  return (
    <section className={[styles.section, menuStyles.section].join(' ')}>
      <h1
        className={expand ? null : styles.closed}
        onClick={() => setExpand(!expand)}
      >
        {expand ? <ChevronDown/> : <ChevronRight/>}  Versions
      </h1>
      {exporting && (
        <Modal cancel={() => setExporting(false)}>
          <Export {...exportVar} />
        </Modal>
      )}
      {expand && (
        <>
          <ul className={styles.versionsList}>
            {readOnly && <li key={`showVersion-GoLive`}>
              <Link to={`/article/${article._id}`}>Back to edit mode</Link>
            </li>}
            {versions.map((v) => (
              <li
                key={`showVersion-${v._id}`}
                className={
                  v._id === selectedVersion
                    ? styles.selected
                    : v._id === compareTo
                    ? styles.compareTo
                    : null
                }
              >
                <Link to={`/article/${article._id}/version/${v._id}`}>
                  {v.message ? v.message : 'No label'}
                  ({v.version}.{v.revision})
                </Link>
                <p>
                  {v.owner && (
                    <span>
                      by <strong>{v.owner.displayName}</strong>{' '}
                    </span>
                  )}
                  {lastVersionId !== v._id && <span>at {new Date(v.updatedAt).formatMMDDYYYY()}</span>}
                  {lastVersionId === v._id && <span>{savedAgo}</span>}
                </p>
                <ul className={styles.actions}>
                  {lastVersionId === v._id && !readOnly && (
                    <li>
                      <Button primary={true} onClick={_ => setExpandSaveForm(true)}><Save /> Save</Button>
                    </li>
                  )}
                  {lastVersionId !== v._id && v._id !== compareTo && (
                    <li>
                      <Link
                        className={[buttonStyles.button, buttonStyles.secondary].join(' ')}
                        to={`/article/${article._id}/${
                          selectedVersion
                            ? 'version/' + selectedVersion + '/'
                            : ''
                        }compare/${v._id}`}
                      >
                        Compare
                      </Link>
                    </li>
                  )}
                  {lastVersionId !== v._id && v._id === compareTo && (
                    <li>
                      <Link
                        className={[buttonStyles.button, buttonStyles.secondary].join(' ')}
                        to={`/article/${article._id}/${
                          selectedVersion
                            ? 'version/' + selectedVersion
                            : ''
                        }`}
                      >
                        Stop
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      to={`${lastVersionId === v._id ? `/article/${article._id}` : `/article/${article._id}/version/${v._id}`}/preview`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={[buttonStyles.button, buttonStyles.secondary].join(' ')}
                    >
                      Preview
                    </Link>
                  </li>
                  <li>
                    <Button
                      onClick={() => {
                        setExportVar({
                          ...exportVar,
                          article: false,
                          _id: v._id,
                          versionId: v._id,
                          version: v.version,
                          revision: v.revision,
                        })
                        setExporting(true)
                      }}
                    >
                      Export
                    </Button>
                  </li>
                </ul>
                {lastVersionId === v._id && expandSaveForm && (
                  <form
                    className={styles.saveForm}
                    onSubmit={(e) => saveVersion(e, false)}
                  >
                    <Field
                      className={styles.saveVersionInput}
                      placeholder="Label of the version"
                      value={message}
                      onChange={(e) => setMessage(etv(e))}
                    />
                    <ul className={styles.actions}>
                      <li><Button icon={true} onClick={(e) => saveVersion(e, false)}>Close</Button></li>
                      <li><Button onClick={(e) => saveVersion(e, false)}>Save Minor</Button></li>
                      <li><Button onClick={(e) => saveVersion(e, true)}>Save Major</Button></li>
                    </ul>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default connect(mapStateToProps)(Versions)
