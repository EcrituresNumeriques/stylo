import React, { useCallback, useState } from 'react'
import { useHistory } from 'react-router-dom'

import styles from './CompareSelect.module.scss'
import Select from '../../../Select'
import { useSelector } from 'react-redux'

export default function CompareSelect({
  articleId,
  selectedVersion,
  compareTo,
  currentArticleVersion,
  readOnly,
}) {
  const articleVersions = useSelector((state) => state.articleVersions)
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
  const versionTitle = readOnly ? currentArticleVersionTitle : 'Working Copy'
  return (
    <section className={styles.compareVersions}>
      <h2>Compare Versions</h2>
      <div className={styles.versions}>
        <div>{versionTitle}</div>
        <div className={styles.modifiedVersion}>
          <Select onChange={handleCompareSelect} value={compareTo}>
            <option value={false}>Stop compare</option>
            {articleVersions.map((v) => (
              <option value={v._id} key={`versionCompare-${v._id}`}>
                {v.message || 'No label'} v{v.version}.{v.revision}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </section>
  )
}
