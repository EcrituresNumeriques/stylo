import { Loading, Modal as GeistModal, useModal } from '@geist-ui/core'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { shallowEqual, useSelector } from 'react-redux'
import { CurrentUserContext } from '../contexts/CurrentUser'
import { Search } from 'react-feather'
import { Helmet } from 'react-helmet'

import useFetchData from '../hooks/graphql'
import { applicationConfig } from '../config.js'
import { getUserArticles, getWorkspaceArticles } from './Articles.graphql'
import etv from '../helpers/eventTargetValue'

import Article from './Article'
import ArticleCreate from './ArticleCreate.jsx'

import styles from './articles.module.scss'
import Field from './Field'
import Button from './Button.jsx'
import { useActiveUserId } from '../hooks/user'
import WorkspaceLabel from './workspace/WorkspaceLabel.jsx'
import { useActiveWorkspace } from '../hooks/workspace.js'
import TagsList from './tag/TagsList.jsx'

export default function Articles() {
  const { t } = useTranslation()
  const { backendEndpoint } = applicationConfig
  const currentUser = useSelector((state) => state.activeUser, shallowEqual)
  const selectedTagIds = useSelector(
    (state) => state.activeUser.selectedTagIds || []
  )
  const {
    visible: createArticleVisible,
    setVisible: setCreateArticleVisible,
    bindings: createArticleModalBinding,
  } = useModal()
  const activeUserId = useActiveUserId()
  const [filter, setFilter] = useState('')
  const activeWorkspace = useActiveWorkspace()
  const activeWorkspaceId = useMemo(
    () => activeWorkspace?._id,
    [activeWorkspace]
  )

  const query = useMemo(
    () => (activeWorkspaceId ? getWorkspaceArticles : getUserArticles),
    [activeWorkspaceId]
  )
  const variables = useMemo(
    () =>
      activeWorkspaceId
        ? { workspaceId: activeWorkspaceId }
        : { user: activeUserId },
    [activeWorkspaceId]
  )
  const { data, isLoading, mutate } = useFetchData(
    { query, variables },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  const articles = useMemo(
    () =>
      (activeWorkspaceId ? data?.workspace?.articles : data?.articles) || [],
    [activeWorkspaceId, data]
  )

  const handleArticleUpdated = useCallback(
    async (updatedArticle) => {
      const updatedArticles = articles.map((article) =>
        article._id === updatedArticle._id ? updatedArticle : article
      )
      if (activeWorkspaceId) {
        await mutate(
          {
            workspace: {
              ...data.workspace,
              articles: updatedArticles,
            },
          },
          { revalidate: false }
        )
      } else {
        await mutate(
          {
            articles: updatedArticles,
          },
          { revalidate: false }
        )
      }
    },
    [articles]
  )

  const handleArticleDeleted = useCallback(
    async (deletedArticle) => {
      const updatedArticles = articles.filter(
        (article) => article._id !== deletedArticle._id
      )
      if (activeWorkspaceId) {
        await mutate(
          {
            workspace: {
              ...data.workspace,
              articles: updatedArticles,
            },
          },
          { revalidate: false }
        )
      } else {
        await mutate(
          {
            articles: updatedArticles,
          },
          { revalidate: false }
        )
      }
    },
    [articles]
  )

  const handleArticleCreated = useCallback(
    async (createdArticle) => {
      setCreateArticleVisible(false)
      const updatedArticles = [createdArticle, ...articles]
      if (activeWorkspaceId) {
        await mutate(
          {
            workspace: {
              ...data.workspace,
              articles: updatedArticles,
            },
          },
          { revalidate: false }
        )
      } else {
        await mutate(
          {
            articles: updatedArticles,
          },
          { revalidate: false }
        )
      }
    },
    [articles]
  )

  const handleStateUpdated = useCallback(
    (event) => {
      const parsedData = JSON.parse(event.data)
      if (parsedData.articleStateUpdated) {
        const articleStateUpdated = parsedData.articleStateUpdated
        const updatedArticles = articles.map((article) => {
          if (article._id === articleStateUpdated._id) {
            return {
              ...article,
              soloSession: articleStateUpdated.soloSession,
              collaborativeSession: articleStateUpdated.collaborativeSession,
            }
          }
          return article
        })
        if (activeWorkspaceId) {
          mutate(
            {
              workspace: {
                ...data.workspace,
                articles: updatedArticles,
              },
            },
            { revalidate: false }
          )
        } else {
          mutate(
            {
              articles: updatedArticles,
            },
            { revalidate: false }
          )
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
        handleStateUpdated(event)
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
      <Helmet>
        <title>
          {t('articles.page.title', {
            workspace: activeWorkspace?.name ?? '$t(workspace.myspace)',
          })}
        </title>
      </Helmet>
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
          <Button primary onClick={() => setCreateArticleVisible(true)}>
            {t('article.createAction.buttonText')}
          </Button>
          <div className={styles.articleCounter}>
            {t('article.count', { count: keepArticles.length })}
          </div>
        </div>

        <GeistModal
          width="40rem"
          visible={createArticleVisible}
          {...createArticleModalBinding}
        >
          <h2>{t('article.createModal.title')}</h2>
          <GeistModal.Content>
            <ArticleCreate
              onSubmit={handleArticleCreated}
              workspaceId={activeWorkspaceId}
            />
          </GeistModal.Content>
          <GeistModal.Action
            passive
            onClick={() => setCreateArticleVisible(false)}
          >
            {t('modal.close.text')}
          </GeistModal.Action>
        </GeistModal>

        {isLoading ? (
          <Loading />
        ) : (
          keepArticles.map((article) => (
            <Article
              key={`article-${article._id}`}
              article={article}
              onArticleUpdated={handleArticleUpdated}
              onArticleDeleted={handleArticleDeleted}
              onArticleCreated={handleArticleCreated}
            />
          ))
        )}
      </section>
    </CurrentUserContext.Provider>
  )
}
