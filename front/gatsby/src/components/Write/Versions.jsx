import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Check, ChevronDown, ChevronRight, Edit, Plus } from 'react-feather'

import styles from './versions.module.scss'
import menuStyles from './menu.module.scss'
import buttonStyles from '../button.module.scss'

import { generateArticleExportId } from '../../helpers/identifier'

import Modal from '../Modal'
import Export from '../Export'
import Button from '../Button'
import Field from "../Field";

const monthNames = {
  0: 'Jan',
  1: 'Feb',
  2: 'Mar',
  3: 'Apr',
  4: 'May',
  5: 'Jun',
  6: 'Jul',
  7: 'Aug',
  8: 'Sep',
  9: 'Oct',
  10: 'Nov',
  11: 'Dec'
}

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
  const monthName = monthNames[this.getUTCMonth()]
  return `${monthName} ${this.getUTCDate()}, ${this.getFullYear()} at ${this.getUTCHoursDoubleDigit()}:${this.getUTCMinutesDoubleDigit()} (UTC)`
}

const mapStateToProps = ({ articleVersions }) => {
  return { articleVersions }
}

const Versions = ({ article, articleVersions, selectedVersion, compareTo, readOnly }) => {
  const [expand, setExpand] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [exportParams, setExportParams] = useState({ })
  const [message, setMessage] = useState('')
  const [expandSaveForm, setExpandSaveForm] = useState(false)
  const articleId = article._id

  const saveVersion = async (e, major = false) => {
    e.preventDefault()
    dispatch({ type: 'CREATE_NEW_ARTICLE_VERSION', articleId, message, major })
    setMessage('')
    setExpandSaveForm(false)
  }

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
          <Export {...exportParams} />
        </Modal>
      )}
      {expand && (
        <>
          <section className={styles.create}>
            {readOnly && <li key={`edit-working-version`}>
              <Link className={[buttonStyles.button, buttonStyles.secondary].join(' ')} to={`/article/${articleId}`}><Edit/> Edit</Link>
            </li>}
            {!readOnly && (
              <li>
                <Button onClick={_ => setExpandSaveForm(true)}><Plus/> Create new Version</Button>
              </li>
            )}
            {expandSaveForm && (
              <form
                className={styles.saveForm}
                onSubmit={(e) => saveVersion(e, false)}
              >
                <Field
                  className={styles.saveVersionInput}
                  placeholder="Label of the version"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <input id="majorVersion" name="majorVersion" type="checkbox" onChange={(e) => {
                  console.log({ e })
                }}/>
                <label htmlFor="majorVersion">Major Version</label>
                <ul className={styles.createActions}>
                  <li><Button icon={true} onClick={(e) => setExpandSaveForm(false)}>Close</Button></li>
                  <li><Button primary={true} onClick={(e) => saveVersion(e, false)}><Check/> Create</Button></li>
                </ul>
              </form>
            )}
          </section>
          <ul className={styles.versionsList}>
            {articleVersions.map((v) => (
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
                <Link to={`/article/${articleId}/version/${v._id}`}>
                  {v.message ? v.message : 'No label'}
                  ({v.version}.{v.revision})
                </Link>
                <p>
                  {v.owner && (
                    <span>
                      by <strong>{v.owner.displayName}</strong>{' '}
                    </span>
                  )}
                  {<span>on {new Date(v.updatedAt).formatMMDDYYYY()}</span>}
                </p>
                <ul className={styles.actions}>
                  {v._id !== compareTo && (
                    <li>
                      <Link
                        className={[buttonStyles.button, buttonStyles.secondary].join(' ')}
                        to={`/article/${articleId}/${
                          selectedVersion
                            ? 'version/' + selectedVersion + '/'
                            : ''
                        }compare/${v._id}`}
                      >
                        Compare
                      </Link>
                    </li>
                  )}
                  {v._id === compareTo && (
                    <li>
                      <Link
                        className={[buttonStyles.button, buttonStyles.secondary].join(' ')}
                        to={`/article/${articleId}/${
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
                      to={`/article/${articleId}/version/${v._id}/preview`}
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
                        setExportParams({
                          exportId: generateArticleExportId(article.title, v.version, v.revision),
                          articleVersionId: v._id
                        })
                        setExporting(true)
                      }}
                    >
                      Export
                    </Button>
                  </li>
                </ul>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default connect(mapStateToProps)(Versions)
