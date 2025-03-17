import React, { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Loading } from '@geist-ui/core'
import { Helmet } from 'react-helmet'

import { useStyloExportPreview } from '../hooks/stylo-export.js'
import { toYaml } from './Write/metadata/yaml.js'
import useFetchData from '../hooks/graphql.js'
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
          yaml_content: root?.yaml,
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
          (obj, { article }, index) => ({
            md_content: obj.md_content + '\n\n\n' + article.workingVersion.md,
            yaml_content:
              index === 0
                ? toYaml(data.corpus.medatada) +
                  '\n\n---\n\n' +
                  article.workingVersion.yaml
                : obj.yaml_content +
                  '\n\n---\n\n' +
                  article.workingVersion.yaml,
            bib_content:
              obj.bib_content + '\n\n---\n\n' + article.workingVersion.bib,
          }),
          {
            md_content: '',
            yaml_content: '',
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
        strategyId === 'article'
          ? version
            ? 'htmlVersion'
            : 'htmlArticle'
          : 'htmlBook'
      }/${version ?? id}?preview=true`
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

  const { data, isLoading: isDataLoading } = useFetchData(
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
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>{strategy.title(data)}</title>
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      </Helmet>

      <section dangerouslySetInnerHTML={{ __html }} />
    </>
  )
}
