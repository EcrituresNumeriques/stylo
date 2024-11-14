import { Button, useInput, useToasts } from '@geist-ui/core'
import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import etv from '../helpers/eventTargetValue'
import { useGraphQL } from '../helpers/graphQL'
import { createArticle } from './Articles.graphql'
import Field from './Field.jsx'
import { getTags } from './Tag.graphql'

import styles from './articleCreate.module.scss'
import ArticleTag from './Tag'
import { useCurrentUser } from '../contexts/CurrentUser'


export default function ArticleCreate ({ onSubmit }) {
  const { t } = useTranslation()
  const { setToast } = useToasts()
  const { state: title, bindings: titleBindings } = useInput('')
  const titleInputRef = useRef()
  const [tags, setTags] = useState([])
  const [selectedTagIds, setSelectedtagIds] = useState([])
  const runQuery = useGraphQL()
  const activeUser = useCurrentUser()

  useEffect(() => {
    if (titleInputRef.current !== undefined) {
      titleInputRef.current.focus()
    }
  }, [titleInputRef])

  useEffect(() => {
    // Self invoking async function
    (async () => {
      try {
        const { user: { tags } } = await runQuery({ query: getTags, variables: {} })
        setTags(tags)
      } catch (err) {
        setToast({
          text: t('article.getTags.error', {errMessage: err }),
          type: 'error'
        })
      }
    })()
  }, [])

  const handleSubmit = useCallback(async (event) => {
    try {
      event.preventDefault()
      const result = await runQuery({ query: createArticle, variables: { user: activeUser._id, title, tags: selectedTagIds } })
      const createdArticle = {
        ...result.createArticle,
        tags: result.createArticle.addTags
      }
      delete createdArticle.addTags
      onSubmit(createdArticle)
      setToast({
        text: t('article.create.successNotification'),
        type: 'default'
      })
    } catch (err) {
      setToast({
        text: t('article.create.errorNotification', {errMessage: err}),
        type: 'error'
      })
    }
  }, [title, selectedTagIds])

  const toggleCheckedTags = useCallback(event => {
    const _id = etv(event)
    selectedTagIds.includes(_id)
      ? setSelectedtagIds(selectedTagIds.filter(tagId => tagId !== _id))
      : setSelectedtagIds([...selectedTagIds, _id])
  }, [selectedTagIds])

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <Field
          ref={titleInputRef}
          {...titleBindings}
          label={t('article.createForm.titleField')}
          type="text"
          className={styles.titleField}
        />
        {tags.length > 0 && <div className={styles.field}>
          <label>{t('article.createForm.tagsField')}</label>
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
        </div>}
        <ul className={styles.actions}>
          <li>
            <Button type="secondary"
                    className={styles.button}
                    title={t('article.createForm.buttonTitle')}
                    onClick={handleSubmit}>{t('article.createForm.buttonText')}
            </Button>
          </li>
        </ul>
      </form>
    </section>
  )
}
