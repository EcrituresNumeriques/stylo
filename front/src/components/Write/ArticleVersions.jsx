import clsx from 'clsx'
import React, { useCallback } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import Versions from './Versions.jsx'

import styles from './ArticleVersions.module.css'

export default function ArticleVersions({
  articleId,
  selectedVersion,
  compareTo,
  readOnly,
}) {
  const expand = useSelector((state) => state.articlePreferences.expandVersions)
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const toggleExpand = useCallback(
    () =>
      dispatch({ type: 'ARTICLE_PREFERENCES_TOGGLE', key: 'expandVersions' }),
    []
  )
  return (
    <>
      <h2 className={clsx(styles.title)} onClick={toggleExpand}>
        {expand ? <ChevronDown /> : <ChevronRight />}
        {t('write.titleVersion.sidebar')}
      </h2>
      {expand && (
        <Versions
          showTitle={false}
          articleId={articleId}
          selectedVersion={selectedVersion}
          compareTo={compareTo}
          readOnly={readOnly}
        />
      )}
    </>
  )
}
