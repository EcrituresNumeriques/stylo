import React, { useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router'
import { useWindowSize } from 'react-use'

import { applicationConfig } from '../../config.js'
import useFetchData from '../../hooks/graphql.js'
import { useStyloExportPreview } from '../../hooks/stylo-export.js'
import { Loading } from '../molecules/index.js'
import { toYaml } from '../organisms/metadata/yaml.js'

import { getArticlePreview } from '../../hooks/Article.graphql'
import { getCorpusPreview } from '../../hooks/Corpus.graphql'

import './Annotate.scss'

const HYPOTHESIS_SIDEBAR_WIDTH = 428

const strategies = new Map([
  [
    'article',
    {
      canonical_url({ id, version }) {
        const hasVersion = Boolean(version)

        return `${applicationConfig.canonicalBaseUrl}/api/v1/${hasVersion ? 'htmlVersion' : 'htmlArticle'}/${hasVersion ? version : id}?preview=true`
      },
      query({ id, version, workspaceId }) {
        const hasVersion = Boolean(version)

        return {
          query: getArticlePreview,
          variables: {
            id,
            version: hasVersion ? version : 'dummy',
            hasVersion,
          },
        }
      },
      mapContent(data) {
        const root = data.version ?? data.sharedArticle?.workingVersion
        return {
          md_content: root?.md,
          yaml_content: root?.yaml,
          bib_content: root?.bib,
        }
      },
      title(data) {
        const root = data.version ?? data.sharedArticle?.workingVersion
        return root?.title ?? root?.name
      },
    },
  ],
  [
    'corpus',
    {
      canonical_url({ id }) {
        return `${applicationConfig.canonicalBaseUrl}/api/v1/htmlBook/${id}?preview=true`
      },
      query({ id, workspaceId }) {
        return {
          query: getCorpusPreview,
          variables: {
            corpusId: id,
          },
        }
      },
      mapContent(data) {
        return data.sharedCorpus?.articles?.reduce(
          (obj, { article }, index) => ({
            md_content: obj.md_content + '\n\n\n' + article.workingVersion.md,
            yaml_content:
              index === 0
                ? toYaml(data.sharedCorpus?.metadata) +
                  '\n\n' +
                  article.workingVersion.yaml
                : obj.yaml_content + '\n\n' + article.workingVersion.yaml,
            bib_content: obj.bib_content + '\n\n' + article.workingVersion.bib,
          }),
          {
            md_content: '',
            yaml_content: '',
            bib_content: '',
          }
        )
      },
      title(data) {
        return data.sharedCorpus?.name
      },
    },
  ],
])

export default function Annotate({ strategy: strategyId }) {
  const { id, version, workspaceId } = useParams()
  const { width: windowWidth } = useWindowSize()

  const strategy = useMemo(
    () => strategies.get(strategyId),
    [id, version, strategyId]
  )

  if (!strategy) {
    throw Error('Unknown query mapping. Cannot preview this content.')
  }

  const canonicalUrl = strategy.canonical_url({ id, version })

  useEffect(() => {
    const mobileMode = windowWidth < HYPOTHESIS_SIDEBAR_WIDTH * 3
    globalThis.hypothesisConfig = function hypothesisConfig() {
      return {
        enableExperimentalNewNoteButton: true,
        openSidebar: !mobileMode,
        sideBySide: {
          // when 'manual', it does not move the content but overlaps it
          // which is what we want when we do not open it automatically
          // because it means we are in mobile mode
          mode: mobileMode ? 'manual' : 'auto',
          isActive() {
            return true
          },
        },
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
      fallbackData: {},
    }
  )

  const { html: __html, isLoading: isPreviewLoading } = useStyloExportPreview({
    ...strategy.mapContent(data),
    with_toc: true,
    with_nocite: true,
    with_link_citations: true,
  })

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>{strategy.title(data)}</title>
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      </Helmet>

      {isPreviewLoading || (isDataLoading && <Loading />)}
      <section
        dangerouslySetInnerHTML={{ __html }}
        hidden={isPreviewLoading || isDataLoading}
      />
    </>
  )
}
