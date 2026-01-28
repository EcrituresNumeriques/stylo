import { Search } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'

import etv from '../helpers/eventTargetValue.js'
import useFetchData from '../hooks/graphql.js'
import { useModal } from '../hooks/modal.js'
import { Button, Field } from './atoms/index.js'

import Article from './Article.jsx'
import ArticleCreate from './ArticleCreate.jsx'
import LoadingPage from './LoadingPage.jsx'
import Modal from './Modal.jsx'
import TagEditForm from './tag/TagEditForm.jsx'
import TagsList from './tag/TagsList.jsx'
import WorkspaceLabel from './workspace/WorkspaceLabel.jsx'

import { getWorkspaceArticles } from '../hooks/Articles.graphql'

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

  const { articles, /* tags, */ /* corpus */ workspace = {} } = data

  const handleArticleUpdated = useCallback(
    async (updatedArticle) => {
      const updatedArticles = articles.map((article) =>
        article._id === updatedArticle._id ? updatedArticle : article
      )

      await mutate(
        {
          articles: updatedArticles,
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
          articles: updatedArticles,
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
          articles: updatedArticles,
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

  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <div className={styles.section}>
      <Helmet>
        <title>
          {t('articles.page.title', {
            workspace: workspace.name ?? '$t(workspace.myspace)',
          })}
        </title>
      </Helmet>

      <header className={styles.articlesHeader}>
        <h1 id="articles-list-headline">{t('header.articles.link')}</h1>

        <WorkspaceLabel color={workspace.color} name={workspace.name} />
      </header>

      <search aria-label={t('article.search.label')}>
        <Field
          className={styles.searchField}
          type="search"
          icon={Search}
          value={filter}
          label={t('article.search.label')}
          placeholder={t('article.search.placeholder')}
          onChange={(e) => setFilter(etv(e))}
        />

        <fieldset
          className={styles.filtersTags}
          aria-label={t('tag.list.title')}
        >
          <legend>
            <h4 aria-level="2">{t('tag.list.title')}</h4>
          </legend>

          <TagsList action={TagEditForm} />
        </fieldset>
      </search>

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

      <section aria-labelledby="articles-list-headline" role="list">
        <div className={styles.articlesTableHeader}>
          <Button
            testId="create-article-button"
            primary
            onClick={() => createArticleModal.show()}
          >
            {t('article.createAction.buttonText')}
          </Button>

          <span className={styles.articleCounter}>
            {t('article.count', { count: keepArticles.length })}
          </span>
        </div>

        {keepArticles.map((article) => (
          <Article
            key={`article-${article._id}`}
            article={article}
            onArticleUpdated={handleArticleUpdated}
            onArticleDeleted={handleArticleDeleted}
            onArticleCreated={handleArticleCreated}
          />
        ))}
      </section>
    </div>
  )
}
