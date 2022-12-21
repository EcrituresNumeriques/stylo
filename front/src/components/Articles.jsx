import React, { useCallback, useEffect, useState } from 'react'
import { shallowEqual, useSelector, useDispatch } from 'react-redux'

import useGraphQL from '../hooks/graphQL.js'
import query from './Articles.graphql'
import etv from '../helpers/eventTargetValue'

import Article from './Article'
import CreateArticle from './CreateArticle'

import styles from './articles.module.scss'
import buttonStyles from './button.module.scss'
import TagManagement from './TagManagement'
import Button from './Button'
import Field from './Field'
import Loading from './Loading'
import { Search, Users } from 'react-feather'
import ArticleTag from './Tag'
import Select from "./Select";

export default function Articles () {
  const dispatch = useDispatch()

  const [selectedTagIds, setSelectedTagIds] = useState([])
  const [filter, setFilter] = useState('')
  const [filterTags, setFilterTags] = useState([])
  const [creatingArticle, setCreatingArticle] = useState(false)
  const [tagManagement, setTagManagement] = useState(false)

  const currentUserId = useSelector(state => state.userPreferences.currentUser ?? state.activeUser._id)
  const setCurrentUserId = useCallback((userId) => dispatch({ type: 'USER_PREFERENCES_TOGGLE', key: 'currentUser', value: userId }), [])
  const { data, error, isLoading, isValidating, mutate } = useGraphQL({ query, variables: { user: currentUserId } })
  const { user: currentUser = {}, articles = [], tags = [], userGrantedAccess: userAccounts = [] } = data

  const handleCurrentUserChange = useCallback(setCurrentUserId, [currentUserId])

  const handleCloseTag = useCallback(() => setTagManagement(false), [])

  const toggleFilterTags = useCallback((id) => {
    selectedTagIds.includes(id)
      ? setSelectedTagIds(selectedTagIds.filter(tagId => tagId !== id))
      : setSelectedTagIds([...selectedTagIds, id])
  }, [currentUserId, selectedTagIds])

  const filterByTagsSelected = useCallback((article) => {
    const listOfTagsSelected = tags.filter(({ _id }) => selectedTagIds.includes(_id))
    if (listOfTagsSelected.length === 0) {
      return true
    }

    const keepArticle = listOfTagsSelected.some(tag => {
      return article.tags.find(({ _id }) => _id === tag._id)
    })

    return keepArticle
  }, [currentUserId, selectedTagIds])

  return (
    <section className={styles.section}>
      <header className={styles.articlesHeader}>
        <h1>{articles.length} articles for</h1>
        <div className={styles.switchAccount}>
          <Users/>
          <Select className={[styles.accountSelect, buttonStyles.select].join(' ')} value={currentUserId} onChange={(e) => e.target.value && handleCurrentUserChange(e.target.value)}>
            {userAccounts.map((userAccount) => <option key={`userAccount_${userAccount._id}`} value={userAccount._id}>{userAccount.displayName}</option>)}
          </Select>
        </div>
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
        currentUser={currentUser}
        articles={articles}
        // setNeedReload={handleReload}
      />

      <div className={styles.actions}>
        {creatingArticle && (
          <CreateArticle
            currentUser={currentUser}
            tags={tags}
            cancel={() => setCreatingArticle(false)}
            triggerReload={() => {
              // setCreatingArticle(false)
              // setNeedReload(true)
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
                  onClick={() => toggleFilterTags(t._id)}
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
            currentUser={currentUser}
            // setNeedReload={handleReload}
            // updateTagsHandler={handleUpdateTags}
            // updateTitleHandler={handleUpdateTitle}
          />
        ))}
    </section>
  )
}
