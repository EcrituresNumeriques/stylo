import { Search } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'

import etv from '../../helpers/eventTargetValue.js'
import useFetchData from '../../hooks/graphql.js'
import { useModal } from '../../hooks/modal.js'
import { Button, Field, PageTitle } from '../atoms/index.js'
import { Loading } from '../molecules/index.js'
import { ArticleForm, TagEditForm, TagsList } from '../organisms/index.js'

import Article from '../Article.jsx'
import Modal from '../Modal.jsx'
import WorkspaceLabel from '../workspace/WorkspaceLabel.jsx'

import { getWorkspaceArticles } from '../../hooks/Articles.graphql'

import styles from './Articles.module.scss'

export default function Articles() {
  const { t } = useTranslation()
  const selectedTagIds = useSelector(
    (state) => state.activeUser.selectedTagIds || []
  )

  const createArticleModal = useModal()
  const [filter, setFilter] = useState('')
  const { workspaceId: activeWorkspaceId } = useParams()

  const { data, isLoading } = useFetchData(
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
  const { articles, corpus, workspace = {} } = data

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
    return (
      <div className={styles.section}>
        <Loading />
      </div>
    )
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

      <header className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <PageTitle
            id="articles-list-headline"
            title={t('header.articles.link')}
          />
          <Button
            className={styles.button}
            testId="create-article-button"
            primary
            onClick={() => createArticleModal.show()}
          >
            {t('article.createAction.buttonText')}
          </Button>
        </div>
        <search
          className={styles.search}
          aria-label={t('article.search.label')}
        >
          <Field
            className={styles.searchField}
            type="search"
            icon={Search}
            value={filter}
            placeholder={t('article.search.placeholder')}
            onChange={(e) => setFilter(etv(e))}
          />
        </search>
      </header>
      <WorkspaceLabel color={workspace.color} name={workspace.name} />
      <fieldset className={styles.filtersTags} aria-label={t('tag.list.title')}>
        <legend>
          <h4 aria-level="2">{t('tag.list.title')}</h4>
        </legend>

        <TagsList action={TagEditForm} />
      </fieldset>
      <Modal
        {...createArticleModal.bindings}
        title={t('article.createModal.title')}
      >
        <ArticleForm
          onSubmit={() => createArticleModal.close()}
          workspaceId={activeWorkspaceId}
          onCancel={() => createArticleModal.close()}
        />
      </Modal>

      <section aria-labelledby="articles-list-headline" role="list">
        <div className={styles.articlesTableHeader}>
          <span className={styles.articleCounter}>
            {t('article.count', { count: keepArticles.length })}
          </span>
        </div>

        <div className={styles.articlesList}>
          {keepArticles.map((article) => (
            <Article
              key={`article-${article._id}`}
              article={article}
              corpus={corpus.filter((c) =>
                c.articles.map((a) => a.article._id).includes(article._id)
              )}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
