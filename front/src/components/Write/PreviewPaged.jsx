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

  return <>
    <Loading label="Processing paginated preview…" hidden={!isLoading} />
    <section className={clsx(styles.pagedContainer, 'stylo-pagedjs-container')} ref={renderRef}>
      <template data-ref="pagedjs-content" />
    </section>
  </>
}
