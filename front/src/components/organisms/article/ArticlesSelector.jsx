import { CheckIcon, Search } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import useFetchData from '../../../hooks/graphql.js'
import { Button, Field } from '../../atoms/index.js'
import { Loading } from '../../molecules/index.js'

import { getWorkspaceArticles } from '../../../hooks/Articles.graphql'

import styles from './ArticlesSelector.module.scss'

export function ArticlesSelector({ corpusArticles, onUpdate }) {
  const [selectedArticleIds, setSelectedArticleIds] = useState(
    corpusArticles.map((a) => a.article._id)
  )
  const { t } = useTranslation('corpus', { useSuspense: false })
  const [filter, setFilter] = useState('')

  const { workspaceId: activeWorkspaceId } = useParams()
  const {
    data: { articles: workspaceArticles },
    isLoading: isWorkspaceArticlesLoading,
  } = useFetchData(
    {
      query: getWorkspaceArticles,
      variables: {
        workspaceId: activeWorkspaceId,
        isPersonalWorkspace: !activeWorkspaceId,
        filter: {
          workspaceId: activeWorkspaceId,
        },
      },
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      fallbackData: {
        articles: [],
        corpus: [],
        workspace: {},
      },
    }
  )

  const isLoading = isWorkspaceArticlesLoading

  const keepArticles = useMemo(
    () =>
      workspaceArticles.filter(
        (article) =>
          article.title.toLowerCase().indexOf(filter.toLowerCase()) > -1
      ),
    [filter, workspaceArticles]
  )

  const isArticleSelected = useCallback(
    (articleId) => selectedArticleIds.includes(articleId),
    [selectedArticleIds]
  )

  const toggleSelectedArticle = useCallback(
    (articleId) => {
      if (selectedArticleIds.includes(articleId)) {
        const latest = selectedArticleIds.filter((id) => id !== articleId)
        setSelectedArticleIds(latest)
        onUpdate(latest)
      } else {
        const latest = [...selectedArticleIds, articleId]
        setSelectedArticleIds(latest)
        onUpdate(latest)
      }
    },
    [setSelectedArticleIds, selectedArticleIds]
  )

  return (
    <>
      <search aria-label={t('actions.addArticles.filter.label')}>
        <Field
          className={styles.searchField}
          type="search"
          icon={<Search />}
          value={filter}
          label={t('actions.addArticles.filter.label')}
          placeholder={t('actions.addArticles.filter.placeholder')}
          onChange={(e) => setFilter(e.target.value)}
        />
      </search>

      <section
        aria-labelledby="articles-list"
        role="list"
        className={styles.articles}
      >
        {isLoading && <Loading />}
        {!isLoading &&
          keepArticles.map((article) => (
            <div key={`article-${article._id}`} className={styles.article}>
              <div>{article.title}</div>
              <Button
                primary={isArticleSelected(article._id)}
                onClick={() => toggleSelectedArticle(article._id)}
              >
                {isArticleSelected(article._id) && <CheckIcon />}
                {isArticleSelected(article._id)
                  ? t('actions.addArticles.added')
                  : t('actions.addArticles.add')}
              </Button>
            </div>
          ))}
      </section>
    </>
  )
}
