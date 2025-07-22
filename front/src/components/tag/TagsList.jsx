import { Settings, Tag } from 'lucide-react'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import useFetchData from '../../hooks/graphql'

import { useModal } from '../../hooks/modal.js'
import { useArticleFiltersStore } from '../../stores/articleStore.js'

import Button from '../Button.jsx'
import Modal from '../Modal.jsx'
import ArticleTag from '../Tag.jsx'
import Loading from '../molecules/Loading.jsx'
import TagEditForm from './TagEditForm.jsx'

import { getTags } from '../Tag.graphql'

import styles from './tagsList.module.scss'

export default function TagsList({ action }) {
  const { t } = useTranslation()
  const { filters, toggleTagId } = useArticleFiltersStore()
  const selectedTagIds = filters.selectedTagIds

  console.log({ selectedTagIds, filters })

  const editTagModal = useModal()
  const createTagModal = useModal()

  const { data, isLoading } = useFetchData(
    { query: getTags, variables: {} },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  const tags = data?.user?.tags || []

  const handleTagClicked = useCallback((event) => {
    const { id } = event.target.dataset
    toggleTagId(id)
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
              onClick={handleTagClicked}
              disableAction={false}
              selected={selectedTagIds.includes(tag._id)}
              addon={
                action && (
                  <>
                    <Modal
                      {...editTagModal.bindings}
                      title={
                        <>
                          <Tag /> {t('tag.editForm.title')}
                        </>
                      }
                    >
                      <TagEditForm
                        tag={tag}
                        onSubmit={() => editTagModal.close()}
                        onCancel={() => editTagModal.close()}
                      />
                    </Modal>
                    <Button
                      icon
                      small
                      aria-label={t('tag.editForm.buttonTitle', {
                        name: tag.name,
                      })}
                      type="button"
                      onClick={() => editTagModal.show()}
                    >
                      <Settings size="1rem" />
                    </Button>
                  </>
                )
              }
            ></ArticleTag>
          </li>
        ))}
        <li>
          <Button
            className={styles.createTagButton}
            onClick={() => createTagModal.show()}
          >
            {t('tag.createAction.buttonText')}
          </Button>
        </li>
      </ul>

      <Modal
        {...createTagModal.bindings}
        title={
          <>
            <Tag /> {t('tag.createForm.title')}
          </>
        }
      >
        <TagEditForm
          onSubmit={() => createTagModal.close()}
          onCancel={() => createTagModal.close()}
        />
      </Modal>
    </>
  )
}
