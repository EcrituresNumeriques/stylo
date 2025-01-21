import React, { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Loading } from '@geist-ui/core'
import { useStyloExportPreview } from '../hooks/stylo-export.js'
import useGraphQL from '../hooks/graphql.js'
import { applicationConfig } from '../config.js'

import * as queries from './Preview.graphql'

import './Preview.scss'

const strategies = new Map([
  [
    'article',
    {
      query({ id, version, workspaceId }) {
        const hasVersion = Boolean(version)

        return {
          query: queries.getArticle,
          variables: {
            id,
            version: hasVersion ? version : 'dummy',
            hasVersion,
          },
        }
      },
      mapContent(data) {
        const root = data?.article?.workingVersion ?? data?.version
        return {
          md_content: root?.md,
          metadata_content: root?.metadata,
          bib_content: root?.bib,
        }
      },
      title(data) {
        const root = data?.article?.workingVersion ?? data?.version
        return root.title ?? root.name
      },
    },
  ],
  [
    'corpus',
    {
      query({ id, workspaceId }) {
        return {
          query: queries.getCorpus,
          variables: {
            filter: {
              corpusId: id,
              workspaceId,
            },
          },
        }
      },
      mapContent(data) {
        return data?.corpus?.at(0)?.articles?.reduce(
          (obj, { article }) => ({
            md_content: obj.md_content + '\n\n\n' + article.workingVersion.md,
            metadata_content: Object.keys(obj.metadata_content).length
              ? { ...data.corpus.metadata, ...obj.metadata_content }
              : article.workingVersion.metadata,
            bib_content:
              obj.bib_content + '\n\n---\n\n' + article.workingVersion.bib,
          }),
          {
            md_content: '',
            metadata_content: {},
            bib_content: '',
          }
        )
      },
      title(data) {
        return data?.corpus?.at(0).name
      },
    },
  ],
])

export default function Preview({ strategy: strategyId }) {
  const { id, version, workspaceId } = useParams()
  const { canonicalBaseUrl } = applicationConfig
  const canonicalUrl = canonicalBaseUrl
    ? `${canonicalBaseUrl}/api/v1/${
        strategyId === 'article' ? 'htmlArticle' : 'htmlBook'
      }/${id}?preview=true`
    : null

  const strategy = useMemo(
    () => strategies.get(strategyId),
    [id, version, strategyId]
  )

  if (!strategy) {
    throw Error('Unknown query mapping. Cannot preview this content.')
  }

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

  const { data, isLoading: isDataLoading } = useGraphQL(
    strategy.query({ id, version, workspaceId }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const { html: __html, isLoading: isPreviewLoading } = useStyloExportPreview({
    ...strategy.mapContent(data),
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
      <title>{strategy.title(data)}</title>
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <section dangerouslySetInnerHTML={{ __html }} />
    </>
  )
}
