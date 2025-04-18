import React, { useEffect, useRef, useState } from 'react'
import { useStyloExportPreview } from '../../hooks/stylo-export.js'
import styles from './PreviewPaged.module.scss'
import { Previewer } from 'pagedjs'
import { compileTemplate } from '../../helpers/preview.js'
import clsx from 'clsx'
import Loading from '../molecules/Loading.jsx'

export default function Preview({ preview, metadata, text, bibliography }) {
  const renderRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const { template, stylesheet } = preview
  const md_content = text
  const yaml_content = metadata
  const bib_content = bibliography
  const { html } = useStyloExportPreview({
    md_content,
    yaml_content,
    bib_content,
  })

  useEffect(() => {
    if (html && isLoading) {
      const render = compileTemplate(template)

      const base64Stylesheet = `data:text/css;base64,${btoa(stylesheet)}`
      new Previewer()
        .preview(
          render({ ...metadata, body: html }),
          [base64Stylesheet],
          renderRef.current
        )
        .then(() => setIsLoading(false))
    }
  }, [html, metadata])

  return (
    <>
      <Loading label="Processing paginated preview…" hidden={!isLoading} />
      <section
        className={clsx(styles.pagedContainer, 'stylo-pagedjs-container')}
        ref={renderRef}
      >
        <template data-ref="pagedjs-content" />
      </section>
    </>
  )
}
