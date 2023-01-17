import React, { useCallback, useEffect, useState } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import { CurrentUserContext } from '../contexts/CurrentUser'
import { Search } from 'react-feather'

import { useGraphQL } from '../helpers/graphQL'
import { getUserArticles as query } from './Articles.graphql'
import etv from '../helpers/eventTargetValue'

import Article from './Article'
import CreateArticle from './CreateArticle'

import styles from './articles.module.scss'
import TagManagement from './TagManagement'
import SelectUser from './SelectUser'
import Button from './Button'
import Field from './Field'
import Loading from './Loading'
import ArticleTag from './Tag'
import { useActiveUserId } from '../hooks/user'

export default function Articles () {
  const activeUser = useSelector(state => state.activeUser, shallowEqual)
  const [selectedTagIds, setSelectedTagIds] = useState([])

  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [articles, setArticles] = useState([])
  const [tags, setTags] = useState([])
  const [creatingArticle, setCreatingArticle] = useState(false)
  const [needReload, setNeedReload] = useState(true)
  const [tagManagement, setTagManagement] = useState(false)
  const [currentUser, setCurrentUser] = useState(activeUser)
  const [userAccounts, setUserAccounts] = useState([])

  const currentUserId = useActiveUserId()
  const runQuery = useGraphQL()

  const handleReload = useCallback(() => setNeedReload(true), [])
  const handleUpdateTags = useCallback((articleId, tags) => {
    setArticles([...findAndUpdateArticleTags(articles, articleId, tags)])
  }, [articles])

  const handleCloseTag = useCallback(() => setTagManagement(false), [])
  const toggleFilterTags = useCallback((event) => {
    const { id } = event.target.dataset
    selectedTagIds.includes(id)
      ? setSelectedTagIds(selectedTagIds.filter(tagId => tagId !== id))
      : setSelectedTagIds([...selectedTagIds, id])
  }, [currentUserId, selectedTagIds])

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
    const listOfTagsSelected = tags.filter(({ _id }) => selectedTagIds.includes(_id))

    if (listOfTagsSelected.length === 0) {
      return true
    }

    // if we find at least one matching tag in the selected list, we keep the article
    return listOfTagsSelected.some(tag => {
      return article.tags.find(({ _id }) => _id === tag._id)
    })
  }, [currentUserId, selectedTagIds])

  useEffect(() => {
    if (needReload) {
      //Self invoking async function
      (async () => {
        try {
          const data = await runQuery({ query, variables: { user: currentUserId } })

          //Need to sort by updatedAt desc
          setArticles(data.articles)
          setTags(data.tags)
          setCurrentUser(data.user)
          setUserAccounts(data.userGrantedAccess)
          setIsLoading(false)
          setNeedReload(false)
        } catch (err) {
          alert(err)
        }
      })()
    }
  }, [needReload, currentUserId])

  return (<CurrentUserContext.Provider value={currentUser}>
    <section className={styles.section}>
      <header className={styles.articlesHeader}>
        <h1>{articles.length} articles for</h1>
        <SelectUser accounts={userAccounts} />
      </header>
      <ul className={styles.horizontalMenu}>
        <li>
          <Button primary={true} onClick={() => setCreatingArticle(true)}>
            Create new Article
          </Button>
        </li>
        <li>
          <Button onClick={() => setTagManagement(!tagManagement)}>Manage tags</Button>
        </li>
      </ul>
      <TagManagement
        tags={tags}
        close={handleCloseTag}
        focus={tagManagement}
        articles={articles}
        setNeedReload={handleReload}
      />

      <div className={styles.actions}>
        {creatingArticle && (
          <CreateArticle
            tags={tags}
            cancel={() => setCreatingArticle(false)}
            triggerReload={() => {
              setCreatingArticle(false)
              setNeedReload(true)
            }}
          />
        )}
        <Field className={styles.searchField} type="text" icon={Search} value={filter} placeholder="Search"
                onChange={(e) => setFilter(etv(e))}/>
      </div>

      <aside className={styles.filtersContainer}>
        {tags.length > 0 && <div className={styles.filtersTags}>
          <h4>Filter by Tags</h4>
          <ul className={styles.filterByTags}>
            {tags.map((t) => (
              <li key={`filterTag-${t._id}`}>
                <ArticleTag
                  tag={t}
                  name={`filterTag-${t._id}`}
                  onClick={toggleFilterTags}
                  disableAction={false}
                />
              </li>
            ))}
          </ul>
        </div>}
      </aside>

      <hr className={styles.horizontalSeparator} />

      {isLoading ? <Loading /> : articles
        .filter(filterByTagsSelected)
        .filter(
          (a) => a.title.toLowerCase().indexOf(filter.toLowerCase()) > -1
        )
        .map((article) => (
          <Article
            key={`article-${article._id}`}
            masterTags={tags}
            article={article}
            setNeedReload={handleReload}
            updateTagsHandler={handleUpdateTags}
            updateTitleHandler={handleUpdateTitle}
          />
        ))}
    </section>
  </CurrentUserContext.Provider>)
}
