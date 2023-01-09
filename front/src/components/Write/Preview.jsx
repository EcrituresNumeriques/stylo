import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useStyloExportPreview } from '../../hooks/stylo-export.js'
import styles from './PreviewPaged.module.scss'
import { Previewer } from 'pagedjs'
import clsx from 'clsx'

export default function Preview ({ userStyles }) {
  const renderRef = useRef()
  const md_content = useSelector(state => state.workingArticle.text)
  const yaml_content = useSelector(state => state.workingArticle.metadata)
  const bib_content = useSelector(state => state.workingArticle.bibliography.text)
  const { html: __html, isLoading } = useStyloExportPreview({ md_content, yaml_content, bib_content })

  useEffect(() => {
    if (__html && userStyles) {
      new Previewer()
        .preview(__html, [], renderRef.current)
    }
  }, [__html])

  return userStyles
    ? (<section className={clsx(styles.cssPreviewContainer, 'stylo-pagedjs-container')} ref={renderRef}>
        <style type="text/css">{ userStyles }</style>
        <template data-ref="pagedjs-content" />

      </section>)
    : (<section className={styles.previewPage} dangerouslySetInnerHTML={{ __html }} />)
}
