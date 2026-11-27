import { ListPlus } from 'lucide-react'
import { useCallback, useId, useMemo } from 'react'
import { DndProvider } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import { getCorpus } from '../../../hooks/Corpus.graphql'
import { dragAndDropManager } from '../../../hooks/dnd.js'
import useFetchData from '../../../hooks/graphql.js'
import { useModal } from '../../../hooks/modal.js'
import { Button } from '../../atoms/index.js'
import { Loading } from '../../molecules/index.js'
import ArticlesSelectorModal from '../article/ArticlesSelectorModal.jsx'
import CorpusArticleItems from './CorpusArticleItems.jsx'

import styles from './CorpusArticles.module.scss'

export default function CorpusArticles({ corpusId }) {
  const { t } = useTranslation('corpus', { useSuspense: false })
  const headingId = useId()
  const addArticlesModal = useModal()
  const { data, isLoading, mutate } = useFetchData(
    {
      query: getCorpus,
      variables: { corpusId, includeArticles: true },
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  const corpusArticles = useMemo(() => data?.corpus?.articles || [], [data])

  const handleUpdate = useCallback(() => {
    mutate()
  }, [mutate])

  return (
    <section className={styles.container} aria-labelledby={headingId}>
      <div className={styles.header}>
        <h3 id={headingId} className={styles.heading}>
          {t('articles.label')}
          {!isLoading && (
            <span className={styles.count}>({corpusArticles.length})</span>
          )}
        </h3>
        <Button
          className={styles.addButton}
          onClick={() => addArticlesModal.show()}
          title={t('actions.addArticles.title')}
        >
          <ListPlus aria-hidden />
          {t('actions.addArticles.label')}
        </Button>
      </div>

      {isLoading && <Loading />}
      {!isLoading && corpusArticles.length === 0 && (
        <p className={styles.empty}>{t('articles.empty')}</p>
      )}
      {!isLoading && corpusArticles.length > 0 && (
        <DndProvider manager={dragAndDropManager} backend={undefined}>
          <CorpusArticleItems
            corpusId={corpusId}
            articles={corpusArticles}
            onUpdate={handleUpdate}
          />
        </DndProvider>
      )}
      <ArticlesSelectorModal
        corpusId={corpusId}
        corpusArticles={corpusArticles}
        bindings={addArticlesModal.bindings}
        close={addArticlesModal.close}
        onUpdate={handleUpdate}
      />
    </section>
  )
}
