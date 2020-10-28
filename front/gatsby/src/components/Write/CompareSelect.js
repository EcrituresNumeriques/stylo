import React from 'react'
import { navigate } from 'gatsby'
import styles from './compareSelect.module.scss'

export default (props) => {
  const handleCompareSelect = (e) => {
    const articleId = props.article._id
    const compareVersionId = e.target.value
    const parts = ['article', articleId]
    if (props.selectedVersion) {
      parts.push('version')
      parts.push(props.selectedVersion)
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
    navigate(`/${parts.join('/')}`)
  }

  const liveVersionLabel = props.live.message || 'No label'
  const liveVersionTitle = `${liveVersionLabel} v${props.live.version}.${props.live.revision}`
  const versionTitle = props.readOnly ? liveVersionTitle : 'Editing mode'
  const title = `Comparing ${versionTitle} with `
  return (
    <p className={styles.compare}>
      {title}
      <select onChange={(e) => handleCompareSelect(e)}>
        <option value={false}>Stop compare</option>
        {props.versions.map((v) => (
          <option
            value={v._id}
            key={`versionCompare-${v._id}`}
            selected={props.compareTo === v._id}
          >
            {v.message || 'No label'} v{v.version}.{v.revision}
          </option>
        ))}
      </select>
    </p>
  )
}
