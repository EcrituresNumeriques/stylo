import React, { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Loading } from '@geist-ui/core'
import { useStyloExportPreview } from '../hooks/stylo-export.js'
import useGraphQL from '../hooks/graphql.js'

import { getArticle as query } from './Preview.graphql'

import './Preview.scss'

export default function Preview() {
  const { id } = useParams()

  useEffect(() => {
    globalThis.hypothesisConfig = function hypothesisConfig() {
      return {
        // enableExperimentalNewNoteButton: true,
        openSidebar: false,
        // theme: 'clean',
        // contentReady: Promise
        /*branding: {
          appBackgroundColor: 'white',
          ctaBackgroundColor: 'rgba(3, 11, 16, 1)',
          ctaTextColor: '#eee',
          selectionFontFamily: 'helvetica, arial, sans serif'
        }*/
      }
    }

    const script = document.createElement('script')
    script.src = 'https://hypothes.is/embed.js'
    script.async = true
    document.body.appendChild(script)
    script.onload = () => console.log('script loaded')

    return () => document.body.removeChild(script)
  }, [])

  const { data, isLoading: isDataLoading } = useGraphQL(
    { query, variables: { id } },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const { html: __html, isLoading: isPreviewLoading } = useStyloExportPreview({
    md_content: data?.article?.workingVersion?.md,
    metadata_content: data?.article?.workingVersion?.metadata,
    bib_content: data?.article?.workingVersion?.bib,
    with_toc: true,
    with_nocite: true,
    with_link_citations: true,
  })

  const isLoading = useMemo(
    () => isPreviewLoading || isDataLoading,
    [isPreviewLoading, isDataLoading]
  )

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <section dangerouslySetInnerHTML={{ __html }} />
    </>
  )
}
