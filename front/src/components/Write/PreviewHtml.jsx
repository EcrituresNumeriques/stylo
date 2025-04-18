import React from 'react'

import { useStyloExportPreview } from '../../hooks/stylo-export.js'
import Loading from '../molecules/Loading.jsx'

export default function HtmlPreview({ text, metadata, bibliography }) {
  const { html: __html, isLoading } = useStyloExportPreview({
    md_content: text,
    metadata_content: metadata,
    bib_content: bibliography,
  })

  if (isLoading) {
    return <Loading />
  }

  return <section dangerouslySetInnerHTML={{ __html }} />
}
