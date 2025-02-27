import { Loading, Modal as GeistModal, useModal } from '@geist-ui/core'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import styles from './tagsList.module.scss'
import ArticleTag from '../Tag.jsx'
import Button from '../Button.jsx'
import TagEditForm from './TagEditForm.jsx'
import { getTags } from '../Tag.graphql'
import useGraphQL from '../../hooks/graphql'

export default function TagsList({ action, ActionIcon }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const selectedTagIds = useSelector(
    (state) => state.activeUser.selectedTagIds || []
  )
  const [editedTag, setEditedTag] = useState()

  const {
    visible: tagEditFormVisible,
    setVisible: setTagEditFormVisible,
    bindings: tagEditFormModalBinding,
  } = useModal()
  const { data, isLoading } = useGraphQL(
    { query: getTags, variables: {} },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  const tags = data?.user?.tags || []

  // clears the edited tag when form is not visible anymore
  useEffect(() => {
    if (!tagEditFormVisible) {
      setEditedTag()
    }
  }, [editedTag, tagEditFormVisible])

  const handleTagSelected = useCallback(
    (event) => {
      const { id } = event.target.dataset
      dispatch({ type: 'UPDATE_SELECTED_TAG', tagId: id })
    },
    [selectedTagIds]
  )

  const triggerEditTagForm = useCallback((tag) => {
    setEditedTag(tag)
    setTagEditFormVisible(true)
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      <ul className={styles.filterByTags}>
        {tags.map((tag) => (
          <li key={`filterTag-${tag._id}`}>
            <ArticleTag
              tag={tag}
              name={`filterTag-${tag._id}`}
              onClick={handleTagSelected}
              disableAction={false}
              selected={selectedTagIds.includes(tag._id)}
            >
              {action && (
                <Button
                  icon
                  small
                  aria-label={t('tag.editForm.buttonTitle', { name: tag.name })}
                  type="button"
                  onClick={() => triggerEditTagForm(tag)}
                >
                  <ActionIcon size="1rem" />
                </Button>
              )}
            </ArticleTag>
          </li>
        ))}
        <li>
          <Button
            className={styles.createTagButton}
            onClick={() => setTagEditFormVisible(true)}
          >
            {t('tag.createAction.buttonText')}
          </Button>
        </li>
      </ul>

      <GeistModal
        width="40rem"
        visible={tagEditFormVisible}
        {...tagEditFormModalBinding}
      >
        <h2>
          {editedTag ? t('tag.editForm.title') : t('tag.createForm.title')}
        </h2>
        <GeistModal.Content>
          <TagEditForm
            tag={editedTag}
            onSubmit={() => setTagEditFormVisible(false)}
          />
        </GeistModal.Content>
        <GeistModal.Action passive onClick={() => setTagEditFormVisible(false)}>
          {t('modal.close.text')}
        </GeistModal.Action>
      </GeistModal>
    </>
  )
}
