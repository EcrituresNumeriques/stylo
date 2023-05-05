import { Modal as GeistModal, useModal } from '@geist-ui/core'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { shallowEqual, useSelector } from 'react-redux'
import { CurrentUserContext } from '../contexts/CurrentUser'
import { Search } from 'react-feather'

import { useGraphQL } from '../helpers/graphQL'
import { getUserArticles, getWorkspaceArticles } from './Articles.graphql'
import etv from '../helpers/eventTargetValue'

import Article from './Article'
import ArticleCreate from './ArticleCreate.jsx'

import styles from './articles.module.scss'
import Button from './Button'
import Field from './Field'
import Loading from './Loading'
import { useActiveUserId } from '../hooks/user'
import WorkspaceLabel from './workspace/WorkspaceLabel.jsx'
import { useActiveWorkspace } from '../hooks/workspace.js'
import TagsList from './tag/TagsList.jsx'

export default function Articles () {
  const { t } = useTranslation()
  const currentUser = useSelector(state => state.activeUser, shallowEqual)
  const selectedTagIds = useSelector((state) => state.activeUser.selectedTagIds || [])
  const { visible: createArticleVisible, setVisible: setCreateArticleVisible, bindings: createArticleModalBinding } = useModal()

  const latestTagCreated = useSelector((state) => state.latestTagCreated)

  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [articles, setArticles] = useState([])
  const [userTags, setUserTags] = useState([])

  useEffect(() => {
    if (latestTagCreated) {
      setUserTags([].concat(...userTags, latestTagCreated))
    }
  }, [latestTagCreated])

  const [needReload, setNeedReload] = useState(false)

  const activeUserId = useActiveUserId()
  const activeWorkspace = useActiveWorkspace()
  const activeWorkspaceId = activeWorkspace?._id
  const runQuery = useGraphQL()

  const handleReload = useCallback(() => setNeedReload(true), [])
  const handleUpdateTags = useCallback((articleId, tags) => {
    setArticles([...findAndUpdateArticleTags(articles, articleId, tags)])
  }, [articles])

  const handleCreateNewArticle = useCallback(() => {
    setNeedReload(true)
    setCreateArticleVisible(false)
  }, [])

  const handleUpdateTitle = useCallback((articleId, title) => {
    // shallow copy otherwise React won't render the components again
    setArticles([...findAndUpdateArticleTitle(articles, articleId, title)])
  }, [articles])

  const findAndUpdateArticleTags = (articles, articleId, tags) => {
    const article = articles.find((a) => a._id === articleId)
    article.tags = tags
    return articles
  }

  const findAndUpdateArticleTitle = (articles, articleId, title) => {
    const article = articles.find((a) => a._id === articleId)
    article.title = title
    return articles
  }

  const filterByTagsSelected = useCallback((article) => {
    const listOfTagsSelected = selectedTagIds

    if (listOfTagsSelected.length === 0) {
      return true
    }

    // if we find at least one matching tag in the selected list, we keep the article
    return listOfTagsSelected.some(tagId => {
      return article.tags.find(({ _id }) => _id === tagId)
    })
  }, [activeUserId, selectedTagIds])

  useEffect(() => {
    //Self invoking async function
    (async () => {
      try {
        if (activeWorkspaceId) {
          const data = await runQuery({ query: getWorkspaceArticles, variables: { workspaceId: activeWorkspaceId } })
          setArticles(data.workspace.articles)
          setUserTags(data.tags)
          setIsLoading(false)
          setNeedReload(false)
        } else {
          const data = await runQuery({ query: getUserArticles, variables: { user: activeUserId } })
          // Need to sort by updatedAt desc
          setArticles(data.articles)
          setUserTags(data.tags)
          setIsLoading(false)
          setNeedReload(false)
        }
      } catch (err) {
        alert(err)
      }
    })()
  }, [needReload, activeUserId, activeWorkspaceId])

  const filteredArticles = articles
    .filter(filterByTagsSelected)
    .filter(
      (a) => a.title.toLowerCase().indexOf(filter.toLowerCase()) > -1
    )

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
        {!activeWorkspaceId && <Button primary={true} onClick={() => setCreateArticleVisible(true)}>
          {t('article.createAction.buttonText')}
        </Button>
        }
        <div className={styles.articleCounter}>{filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''}</div>
      </div>

      <GeistModal width='40rem' visible={createArticleVisible} {...createArticleModalBinding}>
        <h2>{t('article.createModal.title')}</h2>
        <GeistModal.Content>
          <ArticleCreate onSubmit={handleCreateNewArticle} />
        </GeistModal.Content>
      </GeistModal>

      {isLoading ? <Loading/> : filteredArticles
        .map((article) => (
          <Article
            key={`article-${article._id}`}
            userTags={userTags}
            article={article}
            setNeedReload={handleReload}
            updateTagsHandler={handleUpdateTags}
            updateTitleHandler={handleUpdateTitle}
          />
        ))}
    </section>
  </CurrentUserContext.Provider>)
}
