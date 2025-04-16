import React, { useCallback, useMemo } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import useFetchData from '../../hooks/graphql.js'
import { useActiveWorkspace } from '../../hooks/workspace.js'
import Alert from '../molecules/Alert.jsx'
import Loading from '../molecules/Loading.jsx'
import CorpusArticleItems from './CorpusArticleItems.jsx'

import styles from './corpusItem.module.scss'

import { getCorpus } from './Corpus.graphql'

export default function CorpusArticles({ corpusId }) {
  const { t } = useTranslation()
  const activeWorkspace = useActiveWorkspace()
  const activeWorkspaceId = useMemo(
    () => activeWorkspace?._id,
    [activeWorkspace]
  )
  const { data, isLoading, mutate } = useFetchData(
    {
      query: getCorpus,
      variables: { filter: { corpusId: corpusId }, includeArticles: true },
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  const corpusArticles = useMemo(
    () => data?.corpus?.[0]?.articles || [],
    [data]
  )

  const handleUpdate = useCallback(() => {
    mutate()
  }, [mutate])

  return (
    <>
      <h5 className={styles.partsTitle}>{t('corpus.parts.label')}</h5>
      {isLoading && <Loading />}
      {!isLoading && corpusArticles.length > 0 && (
        <ul>
          <DndProvider backend={HTML5Backend}>
            <CorpusArticleItems
              corpusId={corpusId}
              articles={corpusArticles}
              onUpdate={handleUpdate}
            />
          </DndProvider>
        </ul>
      )}
      {!isLoading && corpusArticles.length === 0 && (
        <Alert
          className={styles.message}
          type={'info'}
          message={
            <Trans i18nKey="corpus.addPart.note">
              To add a new chapter, go to the
              <Link
                to={
                  activeWorkspaceId
                    ? `/workspaces/${activeWorkspaceId}/articles`
                    : '/articles'
                }
              >
                articles page
              </Link>
              and select this corpus.
            </Trans>
          }
        />
      )}
    </>
  )
}
