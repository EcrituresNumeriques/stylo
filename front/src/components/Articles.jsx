import React, { useCallback, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'

import useFetchData from '../hooks/graphql'
import { useModal } from '../hooks/modal.js'

import Article from './Article'
import ArticleCreate from './ArticleCreate.jsx'
import Button from './Button.jsx'
import Field from './Field'
import Modal from './Modal.jsx'
import LoadingPage from './LoadingPage.jsx'
import TagEditForm from './tag/TagEditForm.jsx'
import TagsList from './tag/TagsList.jsx'
import WorkspaceLabel from './workspace/WorkspaceLabel.jsx'
import etv from '../helpers/eventTargetValue'

import { getWorkspaceArticles } from './Articles.graphql'

import styles from './articles.module.scss'

export default function Articles() {
  const { t } = useTranslation()
  const selectedTagIds = useSelector(
    (state) => state.activeUser.selectedTagIds || []
  )

  const createArticleModal = useModal()
  const [filter, setFilter] = useState('')
  const { workspaceId: activeWorkspaceId } = useParams()

  const { data, isLoading, mutate } = useFetchData(
    {
      query: getWorkspaceArticles,
      variables:
      {
        workspaceId: activeWorkspaceId,
        isPersonalWorkspace: !activeWorkspaceId,
        filter: {
          workspaceId: activeWorkspaceId
        }
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      fallbackData: {
        articles: [],
        corpus: [],
        workspace: {}
      }
    }
  )

  const { articles, /* tags, */ /* corpus */ workspace = {} } = data

  const handleArticleUpdated = useCallback(
    async (updatedArticle) => {
      const updatedArticles = articles.map((article) =>
        article._id === updatedArticle._id ? updatedArticle : article
      )

      await mutate(
        {
          workspace: {
            ...data.workspace,
            articles: updatedArticles,
          },
        },
        { revalidate: false }
      )
    },
    [articles]
  )

  const handleArticleDeleted = useCallback(
    async (deletedArticle) => {
      const updatedArticles = articles.filter(
        (article) => article._id !== deletedArticle._id
      )

      await mutate(
        {
          workspace: {
            ...data.workspace,
            articles: updatedArticles,
          },
        },
        { revalidate: false }
      )
    },
    [articles]
  )

  const handleArticleCreated = useCallback(
    async (createdArticle) => {
      createArticleModal.close()
      const updatedArticles = [createdArticle, ...articles]

      await mutate(
        {
          workspace: {
            ...data.workspace,
            articles: updatedArticles,
          },
        },
        { revalidate: false }
      )
    },
    [articles]
  )

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
    <section className={styles.section}>
      <Helmet>
        <title>
          {t('articles.page.title', {
            workspace: workspace.name ?? '$t(workspace.myspace)',
          })}
        </title>
      </Helmet>

      <header className={styles.articlesHeader}>
        <h1>{t('header.articles.link')}</h1>
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
          <TagsList action={TagEditForm} />
        </div>
      </aside>

      <div className={styles.articlesTableHeader}>
        <Button primary onClick={() => createArticleModal.show()}>
          {t('article.createAction.buttonText')}
        </Button>
        <div className={styles.articleCounter}>
          {t('article.count', { count: keepArticles.length })}
        </div>
      </div>

      <Modal
        {...createArticleModal.bindings}
        title={t('article.createModal.title')}
      >
        <ArticleCreate
          onSubmit={handleArticleCreated}
          workspaceId={activeWorkspaceId}
          onCancel={() => createArticleModal.close()}
        />
      </Modal>

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
  )
}
