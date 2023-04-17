import React, { createRef, useCallback, useEffect, useState } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import { CurrentUserContext } from '../contexts/CurrentUser'
import { Search } from 'react-feather'

import { useGraphQL } from '../helpers/graphQL'
import { getUserArticles, getWorkspaceArticles } from './Articles.graphql'
import etv from '../helpers/eventTargetValue'

import Article from './Article'
import CreateArticle from './CreateArticle'

import styles from './articles.module.scss'
import Button from './Button'
import Field from './Field'
import Loading from './Loading'
import { useActiveUserId } from '../hooks/user'
import WorkspaceLabel from './header/WorkspaceLabel.jsx'
import { useActiveWorkspace } from '../hooks/workspace.js'
import TagsList from './tag/TagsList.jsx'
import Modal from './Modal.jsx'

export default function Articles () {
  const activeUser = useSelector(state => state.activeUser, shallowEqual)
  const selectedTagIds = useSelector((state) => state.activeUser.selectedTagIds)
  const [creatingArticle, setCreatingArticle] = useState(false)

  const latestTagCreated = useSelector((state) => state.latestTagCreated)

  const articleTitleField = createRef()
  useEffect(() => {
    if (articleTitleField.current) {
      articleTitleField.current.focus() // give focus to the first form input
    }
  }, [articleTitleField])

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

  const [currentUser, setCurrentUser] = useState(activeUser)

  const activeUserId = useActiveUserId()
  const activeWorkspace = useActiveWorkspace()
  const activeWorkspaceId = activeWorkspace?._id
  const runQuery = useGraphQL()

  const handleCloseCreatingArticle = useCallback(() => setCreatingArticle(false), [])

  const handleReload = useCallback(() => setNeedReload(true), [])
  const handleUpdateTags = useCallback((articleId, tags) => {
    setArticles([...findAndUpdateArticleTags(articles, articleId, tags)])
  }, [articles])


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
          setCurrentUser(data.user)
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
               laceholder="Search"
               onChange={(e) => setFilter(etv(e))}
        />
      </div>

      <aside className={styles.filtersContainer}>
        <div className={styles.filtersTags}>
          <h4>Tags</h4>
          <TagsList/>
        </div>
      </aside>

      <div className={styles.articlesTableHeader}>
        <Button primary={true} onClick={() => setCreatingArticle(true)}>
          Create a new article
        </Button>
        <div className={styles.articleCounter}>{filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''}</div>
      </div>
      {creatingArticle && (
        <Modal title="New article" cancel={handleCloseCreatingArticle}>
          <CreateArticle ref={articleTitleField}/>
        </Modal>
      )}
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
