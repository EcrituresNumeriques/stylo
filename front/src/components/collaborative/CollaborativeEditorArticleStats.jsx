import React from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import styles from './CollaborativeEditorArticleStats.module.scss'


export default function CollaborativeEditorArticleStats () {
  const articleStats = useSelector(state => state.articleStats, shallowEqual)
  return (<ul className={styles.stats}>
    <li>Words : {articleStats.wordCount}</li>
    <li>Characters : {articleStats.charCountNoSpace} (with spaces: {articleStats.charCountPlusSpace})</li>
    <li>Citations : {articleStats.citationNb}</li>
  </ul>)
}
