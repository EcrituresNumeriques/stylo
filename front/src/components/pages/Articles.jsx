import { Search } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useParams, useSearchParams } from 'react-router'

import etv from '../../helpers/eventTargetValue.js'
import { getWorkspaceArticles } from '../../hooks/Articles.graphql'
import useFocusZone from '../../hooks/focusZone.js'
import useFetchData from '../../hooks/graphql.js'
import { useModal } from '../../hooks/modal.js'
import { useWorkspaceName } from '../../hooks/workspace.js'
import { Button, Field, PageTitle } from '../atoms/index.js'
import { Loading } from '../molecules/index.js'

import Modal from '../molecules/Modal.jsx'
import Article from '../organisms/article/Article.jsx'
import { ArticleForm, TagEditForm, TagsList } from '../organisms/index.js'

import styles from './Articles.module.scss'

export default function Articles() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const selectedTagIds = searchParams.getAll('tag')

  const createArticleModal = useModal()
  const tagsFocusZoneRef = useFocusZone()
  const keyboardHintId = useId()
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
        corpora: [],
        workspace: {},
      },
    }
  )
  const { articles, corpora, workspace = {} } = data
  const workspaceName = useWorkspaceName({ workspace })

  const keepArticles = useMemo(
    () =>
      articles
        .filter((article) => {
          if (selectedTagIds.length === 0) {
            return true
          }
          // if we find at least one matching tag in the selected list, we keep the article
          return selectedTagIds.some((tagId) =>
            article.tags.find(({ id }) => id === tagId)
          )
        })
        .filter(
          (article) =>
            article.title.toLowerCase().indexOf(filter.toLowerCase()) > -1
        ),
    [filter, articles, searchParams]
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
        <title>{t('articles.page.title', { workspace: workspaceName })}</title>
      </Helmet>

      <div className={styles.header}>
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
              icon={<Search />}
              value={filter}
              placeholder={t('article.search.placeholder')}
              onChange={(e) => setFilter(etv(e))}
            />
          </search>
        </header>

        <fieldset
          ref={tagsFocusZoneRef}
          // biome-ignore lint/a11y/noNoninteractiveTabindex: focus zone, Enter gives access to its content
          tabIndex={0}
          className={styles.filtersTags}
          aria-label={t('tag.list.title')}
          aria-describedby={keyboardHintId}
        >
          <legend>
            <h4 aria-level="2">{t('tag.list.title')}</h4>
          </legend>

          <TagsList action={TagEditForm} />
        </fieldset>
      </div>

      <p id={keyboardHintId} hidden>
        {t('focusZone.hint')}
      </p>

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

        <div>
          {keepArticles.map((article) => (
            <Article
              key={`article-${article.id}`}
              article={article}
              keyboardHintId={keyboardHintId}
              corpus={corpora.filter((c) =>
                c.articles.map((a) => a.article.id).includes(article.id)
              )}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
