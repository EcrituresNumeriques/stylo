import { Loading, Modal as GeistModal, useModal, Button as GeistButton } from '@geist-ui/core'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { shallowEqual, useSelector } from 'react-redux'
import { CurrentUserContext } from '../contexts/CurrentUser'
import { Search } from 'react-feather'

import useGraphQL from '../hooks/graphql'
import { getUserArticles, getWorkspaceArticles } from './Articles.graphql'
import etv from '../helpers/eventTargetValue'

import Article from './Article'
import ArticleCreate from './ArticleCreate.jsx'

import styles from './articles.module.scss'
import Button from './Button'
import Field from './Field'
import { useActiveUserId } from '../hooks/user'
import WorkspaceLabel from './workspace/WorkspaceLabel.jsx'
import { useActiveWorkspace } from '../hooks/workspace.js'
import TagsList from './tag/TagsList.jsx'

export default function Articles () {
  const { t } = useTranslation()
  const currentUser = useSelector(state => state.activeUser, shallowEqual)
  const selectedTagIds = useSelector((state) => state.activeUser.selectedTagIds || [])
  const {
    visible: createArticleVisible,
    setVisible: setCreateArticleVisible,
    bindings: createArticleModalBinding
  } = useModal()
  const activeUserId = useActiveUserId()
  const [filter, setFilter] = useState('')
  const activeWorkspace = useActiveWorkspace()
  const activeWorkspaceId = activeWorkspace?._id

  const query = activeWorkspaceId
    ? getWorkspaceArticles
    : getUserArticles
  const variables = activeWorkspaceId
    ? { workspaceId: activeWorkspaceId }
    : { user: activeUserId }
  const { data, isLoading, mutate } = useGraphQL({ query, variables }, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
  const articles = (activeWorkspaceId ? data?.workspace?.articles : data?.articles) || []
  const corpus = (activeWorkspaceId ? data?.workspace?.corpus : data?.corpus) || []

  const handleArticleUpdated = useCallback(async (updatedArticle) => {
    const updatedArticles = articles.map((article) => article._id === updatedArticle._id ? updatedArticle : article)
    if (activeWorkspaceId) {
      await mutate({
        workspace: {
          ...data.workspace,
          articles: updatedArticles
        }
      }, { revalidate: false })
    } else {
      await mutate({
        articles: updatedArticles
      }, { revalidate: false })
    }
  }, [articles])

  const handleArticleDeleted = useCallback(async (deletedArticle) => {
    const updatedArticles = articles.filter((article) => article._id !== deletedArticle._id)
    if (activeWorkspaceId) {
      await mutate({
        workspace: {
          ...data.workspace,
          articles: updatedArticles
        }
      }, { revalidate: false })
    } else {
      await mutate({
        articles: updatedArticles
      }, { revalidate: false })
    }
  }, [articles])

  const handleArticleCreated = useCallback(async (createdArticle) => {
    setCreateArticleVisible(false)
    const updatedArticles = [createdArticle, ...articles]
    if (activeWorkspaceId) {
      await mutate({
        workspace: {
          ...data.workspace,
          articles: updatedArticles
        }
      }, { revalidate: false })
    } else {
      await mutate({
        articles: updatedArticles
      }, { revalidate: false })
    }
  }, [articles])

  const keepArticles = articles
    .filter((article) => {
      const listOfTagsSelected = selectedTagIds

      if (listOfTagsSelected.length === 0) {
        return true
      }

      // if we find at least one matching tag in the selected list, we keep the article
      return listOfTagsSelected.some(tagId => {
        return article.tags.find(({ _id }) => _id === tagId)
      })
    })
    .filter((article) => article.title.toLowerCase().indexOf(filter.toLowerCase()) > -1)

  return (<CurrentUserContext.Provider value={currentUser}>
    <section className={styles.section}>
      <header className={styles.articlesHeader}>
        <h1>Articles</h1>
        {activeWorkspace && <WorkspaceLabel color={activeWorkspace.color} name={activeWorkspace.name}/>}
      </header>
      <div className={styles.actions}>
        <Field className={styles.searchField}
               type="text"
               icon={Search}
               value={filter}
               placeholder={t('article.search.placeholder')}
               onChange={(e) => setFilter(etv(e))}
        />
      </div>

      <aside className={styles.filtersContainer}>
        <div className={styles.filtersTags}>
          <h4>{t('tag.list.title')}</h4>
          <TagsList/>
        </div>
      </aside>

      <div className={styles.articlesTableHeader}>
        {!activeWorkspaceId && <GeistButton type="secondary" className={styles.button} onClick={() => setCreateArticleVisible(true)}>
          {t('article.createAction.buttonText')}
        </GeistButton>
        }
        <div
          className={styles.articleCounter}>{keepArticles.length} article{keepArticles.length > 1 ? 's' : ''}</div>
      </div>

      <GeistModal width="40rem" visible={createArticleVisible} {...createArticleModalBinding}>
        <h2>{t('article.createModal.title')}</h2>
        <GeistModal.Content>
          <ArticleCreate onSubmit={handleArticleCreated}/>
        </GeistModal.Content>
        <GeistModal.Action passive
                           onClick={() => setCreateArticleVisible(false)}>{t('modal.close.text')}</GeistModal.Action>
      </GeistModal>

      {isLoading ? <Loading/> : keepArticles
        .map((article) => (
          <Article
            key={`article-${article._id}`}
            corpus={corpus}
            article={article}
            onArticleUpdated={handleArticleUpdated}
            onArticleDeleted={handleArticleDeleted}
            onArticleCreated={handleArticleCreated}
          />
        ))}
    </section>
  </CurrentUserContext.Provider>)
}
