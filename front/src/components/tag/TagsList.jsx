import { Modal as GeistModal, useModal } from '@geist-ui/core'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import ArticleCreate from '../ArticleCreate.jsx'

import styles from '../articles.module.scss'
import ArticleTag from '../Tag.jsx'
import Button from '../Button.jsx'
import Modal from '../Modal.jsx'
import TagCreate from '../TagCreate.jsx'
import { getTags } from '../Tag.graphql'
import { useGraphQL } from '../../helpers/graphQL.js'

export default function TagsList () {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [tags, setTags] = useState([])
  const selectedTagIds = useSelector(state => state.activeUser.selectedTagIds)
  const latestTagCreated = useSelector(state => state.latestTagCreated)
  const runQuery = useGraphQL()

  const { visible: createTagVisible, setVisible: setCreateTagVisible, bindings: createTagModalBinding } = useModal()


  useEffect(() => {
    setCreateTagVisible(false)
    // Self invoking async function
    ;(async () => {
      try {
        const { user: { tags } } = await runQuery({ query: getTags, variables: {} })
        setTags(tags)
      } catch (err) {
        alert(err)
      }
    })()
  }, [latestTagCreated])

  const handleTagSelected = useCallback((event) => {
    const { id } = event.target.dataset
    dispatch({ type: 'UPDATE_SELECTED_TAG', tagId: id })
  }, [selectedTagIds])

  return (<>
    <ul className={styles.filterByTags}>
      {tags.map((t) => (
        <li key={`filterTag-${t._id}`}>
          <ArticleTag
            tag={t}
            name={`filterTag-${t._id}`}
            onClick={handleTagSelected}
            disableAction={false}
          />
        </li>
      ))}
      <li>
        <Button className={styles.createTagButton} onClick={() => setCreateTagVisible(true)}>{t('tag.createAction.buttonText')}</Button>
      </li>
    </ul>

    <GeistModal width='40rem' visible={createTagVisible} {...createTagModalBinding}>
      <h2>{t('tag.createForm.title')}</h2>
      <GeistModal.Content>
        <TagCreate/>
      </GeistModal.Content>
    </GeistModal>
  </>)
}
