import React, { useCallback, useState } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'

import styles from './compareSelect.module.scss'

const mapStateToProps = ({ articleVersions }) => {
  return { articleVersions }
}

const CompareSelect = ({
  articleId,
  selectedVersion,
  compareTo,
  currentArticleVersion,
  readOnly,
  articleVersions,
}) => {
  const [compareVersionId, setCompareVersionId] = useState(null)
  const history = useHistory()
  const handleCompareSelect = useCallback(
    (e) => {
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
    },
    [compareVersionId]
  )

  const currentArticleVersionLabel = currentArticleVersion
    ? currentArticleVersion.message || 'No label'
    : ''
  const currentVersionVersionNumber = currentArticleVersion
    ? `v${currentArticleVersion.major}.${currentArticleVersion.minor}`
    : 'latest'
  const currentArticleVersionTitle = [
    currentArticleVersionLabel,
    currentVersionVersionNumber,
  ].join(' ')
  const versionTitle = readOnly ? currentArticleVersionTitle : 'working copy'
  const title = `Comparing ${versionTitle} with `
  return (
    <p className={styles.compare}>
      {title}
      <select onChange={handleCompareSelect} value={compareTo}>
        <option value={false}>Stop compare</option>
        {articleVersions.map((v) => (
          <option value={v._id} key={`versionCompare-${v._id}`}>
            {v.message || 'No label'} v{v.version}.{v.revision}
          </option>
        ))}
      </select>
    </p>
  )
}

CompareSelect.propTypes = {
  articleId: PropTypes.string,
  selectedVersion: PropTypes.string,
  compareTo: PropTypes.string,
  articleVersions: PropTypes.array,
  currentArticleVersion: PropTypes.object,
  readOnly: PropTypes.bool,
}

export default connect(mapStateToProps)(CompareSelect)
