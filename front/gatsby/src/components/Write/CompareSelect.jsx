import React, { useState, useCallback } from 'react'
import { connect } from "react-redux"
import { useHistory } from 'react-router-dom'

import styles from './compareSelect.module.scss'

const mapStateToProps = ({ articleVersions }) => {
  return { articleVersions }
}

const CompareSelect = ({ articleId, articleVersions, selectedVersion, live, readOnly, compareTo }) => {
  const [compareVersionId, setCompareVersionId] = useState(null)
  const history = useHistory()
  const handleCompareSelect = useCallback((e) => {
    const articleId = articleId
    const compareVersionId = e.target.value
    setCompareVersionId(compareVersionId)
    const parts = ['article', articleId]
    if (selectedVersion) {
      parts.push('version')
      parts.push(selectedVersion)
    }
    if (compareVersionId !== 'false') {
      parts.push('compare')
      parts.push(compareVersionId)
    }
    // Format:
    // /article/$articleId
    // /article/$articleId/compare/$compareVersionId
    // /article/$articleId/version/$selectedVersionId
    // /article/$articleId/version/$selectedVersionId/compare/$compareVersionId
    history.push(`/${parts.join('/')}`)
  }, [compareVersionId])

  const liveVersionLabel = live.message || 'No label'
  const liveVersionTitle = `${liveVersionLabel} v${live.version}.${live.revision}`
  const versionTitle = readOnly ? liveVersionTitle : 'Editing mode'
  const title = `Comparing ${versionTitle} with `
  return (
    <p className={styles.compare}>
      {title}
      <select onChange={handleCompareSelect}>
        <option value={false}>Stop compare</option>
        {articleVersions.map((v) => (
          <option
            value={v._id}
            key={`versionCompare-${v._id}`}
          >
            {v.message || 'No label'} v{v.version}.{v.revision}
          </option>
        ))}
      </select>
    </p>
  )
}

export default connect(mapStateToProps)(CompareSelect)
