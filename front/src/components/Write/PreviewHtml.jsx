import React from 'react'
import { useSelector } from 'react-redux'
import { useStyloExportPreview } from '../../hooks/stylo-export.js'
import styles from './write.module.scss'

export default function HtmlPreview() {
  const md_content = useSelector((state) => state.workingArticle.text)
  const metadata_content = useSelector((state) => state.workingArticle.metadata)
  const bib_content = useSelector(
    (state) => state.workingArticle.bibliography.text
  )
  const { html: __html, isLoading } = useStyloExportPreview({
    md_content,
    metadata_content,
    bib_content,
  })

  return (
    <section
      className={styles.previewPage}
      dangerouslySetInnerHTML={{ __html }}
    />
  )
}
