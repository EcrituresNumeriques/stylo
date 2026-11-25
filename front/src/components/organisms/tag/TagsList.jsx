import { Settings, Tag } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import useFetchData from '../../../hooks/graphql.js'
import { useModal } from '../../../hooks/modal.js'
import { getTags } from '../../../hooks/Tag.graphql'
import { Button } from '../../atoms/index.js'
import { Loading } from '../../molecules/index.js'
import Modal from '../../molecules/Modal.jsx'
import ArticleTag from './ArticleTag.jsx'
import TagEditForm from './TagEditForm.jsx'

import styles from './TagsList.module.scss'

export default function TagsList({ action }) {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedTagIds = searchParams.getAll('tag')

  const editTagModal = useModal()
  const [editedTag, setEditedTag] = useState(null)
  const createTagModal = useModal()

  const { data, isLoading } = useFetchData(
    { query: getTags, variables: {} },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  const tags = data?.user?.tags || []

  function handleTagSelected(event) {
    const { id } = event.target.dataset
    const tag = selectedTagIds.includes(id)
      ? selectedTagIds.filter((tagId) => tagId !== id)
      : [...selectedTagIds, id]
    setSearchParams(
      { ...Object.fromEntries(searchParams), tag },
      // the filter is applied in the browser, there is no data to reload
      { replace: true, defaultShouldRevalidate: false }
    )
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      <ul className={styles.filterByTags}>
        {tags.map((tag) => (
          <li key={`filterTag-${tag.id}`}>
            <ArticleTag
              tag={tag}
              name={`filterTag-${tag.id}`}
              onClick={handleTagSelected}
              disableAction={false}
              selected={selectedTagIds.includes(tag.id)}
              addon={
                action && (
                  <Button
                    icon
                    small
                    aria-label={t('tag.editForm.buttonTitle', {
                      name: tag.name,
                    })}
                    type="button"
                    onClick={() => {
                      setEditedTag(tag)
                      editTagModal.show()
                    }}
                  >
                    <Settings size="1rem" />
                  </Button>
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
        {...editTagModal.bindings}
        title={
          <>
            <Tag /> {t('tag.editForm.title')}
          </>
        }
      >
        {editedTag && (
          <TagEditForm
            key={editedTag.id}
            tag={editedTag}
            onSubmit={() => editTagModal.close()}
            onCancel={() => editTagModal.close()}
          />
        )}
      </Modal>

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
