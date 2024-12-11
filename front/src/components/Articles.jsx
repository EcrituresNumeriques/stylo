import { Loading, useModal, Button as GeistButton } from '@geist-ui/core'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { shallowEqual, useSelector } from 'react-redux'
import { CurrentUserContext } from '../contexts/CurrentUser'
import { Search } from 'react-feather'
import { useArticles } from '../hooks/articles.js'

import ArticleCreateModal from './ArticleCreateModal.jsx'
import etv from '../helpers/eventTargetValue'

import Article from './Article'

import styles from './articles.module.scss'
import Field from './Field'
import { useActiveUserId } from '../hooks/user'
import WorkspaceLabel from './workspace/WorkspaceLabel.jsx'
import { useActiveWorkspace } from '../hooks/workspace.js'
import TagsList from './tag/TagsList.jsx'

export default function Articles() {
  const { t } = useTranslation()
  const { backendEndpoint, selectedTagIds } = useSelector((state) => ({
    backendEndpoint: state.applicationConfig.backendEndpoint,
    selectedTagIds: state.activeUser.selectedTagIds || [],
  }))
  const currentUser = useSelector((state) => state.activeUser, shallowEqual)
  const articleCreateModal = useModal()
  const activeUserId = useActiveUserId()
  const [filter, setFilter] = useState('')
  const activeWorkspace = useActiveWorkspace()

  const { articles, isLoading, updateArticle, deleteArticle, createArticle } =
    useArticles()

  const activeWorkspaceId = useMemo(
    () => activeWorkspace?._id,
    [activeWorkspace]
  )

  const handleArticleCreated = useCallback(
    async (createdArticle) => {
      articleCreateModal.setVisible(false)
      await createArticle(createdArticle)
    },
    [createArticle]
  )

  const handleStateUpdated = useCallback(
    async (event) => {
      const parsedData = JSON.parse(event.data)
      if (parsedData.articleStateUpdated) {
        const articleStateUpdated = parsedData.articleStateUpdated
        const article = articles.find(
          (article) => article._id === articleStateUpdated._id
        )
        if (article) {
          await updateArticle({
            ...article,
            soloSession: articleStateUpdated.soloSession,
            collaborativeSession: articleStateUpdated.collaborativeSession,
          })
        }
      }
    },
    [articles]
  )

  useEffect(() => {
    let events
    if (!isLoading) {
      events = new EventSource(
        `${backendEndpoint}/events?userId=${activeUserId}`
      )
      events.onmessage = (event) => {
        void handleStateUpdated(event)
      }
    }
    return () => {
      if (events) {
        events.close()
      }
    }
  }, [isLoading, handleStateUpdated])

  const keepArticles = useMemo(
    () =>
      articles
        .filter((article) => {
          if (selectedTagIds.length === 0) {
            return true
          }
          // if we find at least one matching tag in the selected list, we keep the article
          return selectedTagIds.some((tagId) =>
            article.tags.find(({ _id }) => _id === tagId)
          )
        })
        .filter(
          (article) =>
            article.title.toLowerCase().indexOf(filter.toLowerCase()) > -1
        ),
    [filter, articles, selectedTagIds]
  )

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <section className={styles.section}>
        <header className={styles.articlesHeader}>
          <h1>Articles</h1>
          {activeWorkspace && (
            <WorkspaceLabel
              color={activeWorkspace.color}
              name={activeWorkspace.name}
            />
          )}
        </header>
        <Field
          className={styles.searchField}
          type="text"
          icon={Search}
          value={filter}
          placeholder={t('article.search.placeholder')}
          onChange={(e) => setFilter(etv(e))}
        />

        <aside className={styles.filtersContainer}>
          <div className={styles.filtersTags}>
            <h4>{t('tag.list.title')}</h4>
            <TagsList />
          </div>
        </aside>

        <div className={styles.articlesTableHeader}>
          {!activeWorkspaceId && (
            <GeistButton
              type="secondary"
              className={styles.button}
              onClick={() => articleCreateModal.setVisible(true)}
            >
              {t('article.createAction.buttonText')}
            </GeistButton>
          )}
          <div className={styles.articleCounter}>
            {keepArticles.length} article{keepArticles.length > 1 ? 's' : ''}
          </div>
        </div>

        <ArticleCreateModal
          {...articleCreateModal}
          onCreate={handleArticleCreated}
        />

        {isLoading ? (
          <Loading />
        ) : (
          keepArticles.map((article) => (
            <Article
              key={`article-${article._id}`}
              article={article}
              onArticleUpdated={updateArticle}
              onArticleDeleted={deleteArticle}
              onArticleCreated={handleArticleCreated}
            />
          ))
        )}
      </section>
    </CurrentUserContext.Provider>
  )
}
