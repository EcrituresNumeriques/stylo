import React, { useCallback, useMemo } from 'react'
import { DndProvider } from 'react-dnd'
import { useTranslation } from 'react-i18next'

import { dragAndDropManager } from '../../hooks/dnd.js'
import useFetchData from '../../hooks/graphql.js'
import { useModal } from '../../hooks/modal.js'
import { useActiveWorkspaceId } from '../../hooks/workspace.js'
import { Button } from '../atoms/index.js'
import { Loading } from '../molecules/index.js'

import ArticlesSelectorModal from '../articles/ArticlesSelectorModal.jsx'
import CorpusArticleItems from './CorpusArticleItems.jsx'

import { getCorpus } from '../../hooks/Corpus.graphql'

import styles from './CorpusArticles.module.scss'

export default function CorpusArticles({ corpusId }) {
  const { t } = useTranslation()
  const activeWorkspaceId = useActiveWorkspaceId()
  const addArticlesModal = useModal()
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
      <div className={styles.header}>
        <h4>{t('corpus.parts.label')}</h4>
        <Button onClick={() => addArticlesModal.show()}>
          {t('article.addToCorpus.action')}
        </Button>
      </div>

      {isLoading && <Loading />}
      {!isLoading && corpusArticles.length > 0 && (
        <ul>
          <DndProvider manager={dragAndDropManager}>
            <CorpusArticleItems
              corpusId={corpusId}
              articles={corpusArticles}
              onUpdate={handleUpdate}
            />
          </DndProvider>
        </ul>
      )}
      <ArticlesSelectorModal
        corpusId={corpusId}
        corpusArticles={corpusArticles}
        bindings={addArticlesModal.bindings}
        close={addArticlesModal.close}
        onUpdate={handleUpdate}
      />
    </>
  )
}
