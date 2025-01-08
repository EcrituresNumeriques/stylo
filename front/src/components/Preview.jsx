import React, { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Loading } from '@geist-ui/core'
import { useStyloExportPreview } from '../hooks/stylo-export.js'
import useGraphQL from '../hooks/graphql.js'

import * as queries from './Preview.graphql'

import './Preview.scss'

function mapContent({ query, data }) {
  if (!data) {
    return {}
  }

  if (query === 'getArticle') {
    const root = data?.article?.workingVersion ?? data?.version
    return {
      md_content: root?.md,
      metadata_content: root?.metadata,
      bib_content: root?.bib,
    }
  } else if (query === 'getCorpus') {
    return {
      md_content: '',
      metadata_content: '',
      bib_content: '',
    }
  }

  throw Error('Unknown query mapping. Cannot preview this content.')
}

export default function Preview({ query }) {
  const { id, version } = useParams()

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

    return () => document.body.removeChild(script)
  }, [])

  const hasVersion = Boolean(version)
  const { data, isLoading: isDataLoading } = useGraphQL(
    {
      query: queries[query],
      variables: {
        id,
        version: hasVersion ? version : 'dummy',
        hasVersion,
      },
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const { html: __html, isLoading: isPreviewLoading } = useStyloExportPreview({
    ...mapContent({ data, query }),
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
