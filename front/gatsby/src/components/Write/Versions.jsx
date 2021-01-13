import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import styles from './versions.module.scss'

import Modal from '../Modal'
import Export from '../Export'
import { connect } from 'react-redux'

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

const Versions = (props) => {
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
  const [exporting, setExporting] = useState(false)
  const [exportVar, setExportVar] = useState(expVar)

  return (
    <section id={styles.section}>
      <h1
        className={expand ? null : styles.closed}
        onClick={() => setExpand(!expand)}
      >
        {expand ? '-' : '+'} Versions
      </h1>
      {exporting && (
        <Modal cancel={() => setExporting(false)}>
          <Export {...exportVar} />
        </Modal>
      )}
      {expand && (
        <>
          <ul>
            {props.versions.map((v) => (
              <li
                key={`showVersion-${v._id}`}
                className={
                  v._id === props.selectedVersion
                    ? styles.selected
                    : v._id === props.compareTo
                    ? styles.compareTo
                    : null
                }
              >
                <Link to={`/article/${props.article._id}/version/${v._id}`}>
                  {v.message ? v.message : 'No label'} (
                  {v.autosave ? 'autosaved ' : null}
                  {v.version}.{v.revision})
                </Link>
                <p>
                  {v.owner && (
                    <span>
                      by <strong>{v.owner.displayName}</strong>{' '}
                    </span>
                  )}
                  <span>at {new Date(v.updatedAt).formatMMDDYYYY()}</span>
                </p>
                <nav>
                  {v._id !== props.compareTo && (
                    <Link
                      to={`/article/${props.article._id}/${
                        props.selectedVersion
                          ? 'version/' + props.selectedVersion + '/'
                          : ''
                      }compare/${v._id}`}
                    >
                      Compare
                    </Link>
                  )}
                  {v._id === props.compareTo && (
                    <Link
                      to={`/article/${props.article._id}/${
                        props.selectedVersion
                          ? 'version/' + props.selectedVersion
                          : ''
                      }`}
                    >
                      Stop
                    </Link>
                  )}
                  <p
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
                    export
                  </p>
                  <a
                    href={`https://via.hypothes.is/${props.applicationConfig.exportEndpoint}/api/v1/htmlVersion/${v._id}?preview=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    preview
                  </a>
                </nav>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default connect(mapStateToProps)(Versions)
