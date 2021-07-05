import React from 'react'
import { useHistory } from 'react-router-dom'

import styles from './compareSelect.module.scss'

export default ({ article, selectedVersion, live, readOnly, versions, compareTo }) => {
  const history = useHistory()
  const handleCompareSelect = (e) => {
    const articleId = article._id
    const compareVersionId = e.target.value
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
  }

  const liveVersionLabel = live.message || 'No label'
  const liveVersionTitle = `${liveVersionLabel} v${live.version}.${live.revision}`
  const versionTitle = readOnly ? liveVersionTitle : 'Editing mode'
  const title = `Comparing ${versionTitle} with `
  return (
    <p className={styles.compare}>
      {title}
      <select onChange={(e) => handleCompareSelect(e)}>
        <option value={false}>Stop compare</option>
        {versions.map((v) => (
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
