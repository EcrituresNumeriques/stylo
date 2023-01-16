import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useStyloExportPreview } from '../../hooks/stylo-export.js'
import styles from './PreviewPaged.module.scss'
import { Previewer } from 'pagedjs'
import { compileTemplate } from '../../helpers/preview.js'
import clsx from 'clsx'
import YAML from 'js-yaml'
import Loading from '../Loading.jsx'

export default function Preview ({ preview, yaml }) {
  const renderRef = useRef()
  const [isLoading, setIsLoading] = useState(true)
  const { template, stylesheet } = preview
  const md_content = useSelector(state => state.workingArticle.text)
  const yaml_content = useSelector(state => state.workingArticle.metadata)
  const bib_content = useSelector(state => state.workingArticle.bibliography.text)
  const { html } = useStyloExportPreview({ md_content, yaml_content, bib_content })

  useEffect(() => {
    if (html && isLoading) {
      const [metadata] = YAML.loadAll(yaml)
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
  }, [html, yaml])

  return <>
    <Loading label="Processing paginated preview…" hidden={!isLoading} />
    <section className={clsx(styles.pagedContainer, 'stylo-pagedjs-container')} ref={renderRef}>
      <template data-ref="pagedjs-content" />
    </section>
  </>
}
