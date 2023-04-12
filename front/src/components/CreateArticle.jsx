import React, { useState, useCallback, useEffect, forwardRef } from 'react'

import etv from '../helpers/eventTargetValue'
import { useGraphQL } from '../helpers/graphQL'
import { createArticle as query } from './Articles.graphql'
import { getTags } from './Tag.graphql'

import styles from './createArticle.module.scss'
import Button from './Button'
import Field from './Field'
import ArticleTag from './Tag'
import { useCurrentUser } from '../contexts/CurrentUser'


const CreateArticle = forwardRef((_, forwardedRef) => {
  const [tags, setTags] = useState([])
  const [title, setTitle] = useState('')
  const [selectedTagIds, setSelectedtagIds] = useState([])
  const runQuery = useGraphQL()
  const activeUser = useCurrentUser()

  useEffect(() => {
    // Self invoking async function
    (async () => {
      try {
        const { user: { tags } } = await runQuery({ query: getTags, variables: {} })
        setTags(tags)
      } catch (err) {
        alert(err)
      }
    })()
  }, [])

  const handleSubmit = useCallback(async (event) => {
    const variables = { user: activeUser._id, title, tags: selectedTagIds }
    event.preventDefault()
    await runQuery({ query, variables })
  }, [title, selectedTagIds])

  const handleTitleChange = useCallback(event => setTitle(etv(event)), [])
  const toggleCheckedTags = useCallback(event => {
    const _id = etv(event)
    selectedTagIds.includes(_id)
      ? setSelectedtagIds(selectedTagIds.filter(tagId => tagId !== _id))
      : setSelectedtagIds([...selectedTagIds, _id])
  }, [selectedTagIds])

  return (
    <section className={styles.create}>
      <form onSubmit={handleSubmit}>
        <Field
          ref={forwardedRef}
          label="Title"
          type="text"
          value={title}
          autoFocus={true}
          className={styles.articleTitle}
          onChange={handleTitleChange}
        />
        <div className={styles.field}>
          <label>Tags</label>
          <ul className={styles.tags}>
            {tags.map((t) => (
              <li key={`selectTag-${t._id}`}>
                <ArticleTag
                  tag={t}
                  checked={selectedTagIds.includes(t._id)}
                  name={`selectTag-${t._id}`}
                  onClick={toggleCheckedTags}
                  disableAction={false}
                />
              </li>
            ))}
          </ul>
        </div>
        <ul className={styles.actions}>
          <li>
            <Button primary={true} type="submit" title="Create a new article">Create a new article</Button>
          </li>
        </ul>
      </form>
    </section>
  )
})

CreateArticle.displayName = 'CreateArticle'

export default CreateArticle
