import { Loading, Modal as GeistModal, useModal } from '@geist-ui/core'
import React, { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import styles from './tagsList.module.scss'
import ArticleTag from '../Tag.jsx'
import Button from '../Button.jsx'
import TagCreate from '../TagCreate.jsx'
import { getTags } from '../Tag.graphql'
import useFetchData from '../../hooks/graphql'

export default function TagsList() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const selectedTagIds = useSelector(
    (state) => state.activeUser.selectedTagIds || []
  )
  const {
    visible: createTagVisible,
    setVisible: setCreateTagVisible,
    bindings: createTagModalBinding,
  } = useModal()
  const { data, isLoading } = useFetchData(
    { query: getTags, variables: {} },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  const tags = data?.user?.tags || []
  useEffect(() => {
    setCreateTagVisible(false)
  }, [tags])

  const handleTagSelected = useCallback(
    (event) => {
      const { id } = event.target.dataset
      dispatch({ type: 'UPDATE_SELECTED_TAG', tagId: id })
    },
    [selectedTagIds]
  )

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      <ul className={styles.filterByTags}>
        {tags.map((t) => (
          <li key={`filterTag-${t._id}`}>
            <ArticleTag
              tag={t}
              name={`filterTag-${t._id}`}
              onClick={handleTagSelected}
              disableAction={false}
              selected={selectedTagIds.includes(t._id)}
            />
          </li>
        ))}
        <li>
          <Button
            className={styles.createTagButton}
            onClick={() => setCreateTagVisible(true)}
          >
            {t('tag.createAction.buttonText')}
          </Button>
        </li>
      </ul>

      <GeistModal
        width="40rem"
        visible={createTagVisible}
        {...createTagModalBinding}
      >
        <h2>{t('tag.createForm.title')}</h2>
        <GeistModal.Content>
          <TagCreate />
        </GeistModal.Content>
        <GeistModal.Action passive onClick={() => setCreateTagVisible(false)}>
          {t('modal.close.text')}
        </GeistModal.Action>
      </GeistModal>
    </>
  )
}
