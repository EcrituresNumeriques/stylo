import { Modal as GeistModal, useModal } from '@geist-ui/core'
import React, { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import checkboxStyles from '../Checkbox.module.scss'
import Checkbox from '../Checkbox.jsx'
import Button from '../Button.jsx'
import TagCreate from '../TagCreate.jsx'

export default function TagsList({ tags }) {
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

  useEffect(() => {
    setCreateTagVisible(false)
  }, [tags])

  const handleTagSelected = useCallback(
    (event) => {
      const id = event.target.value
      dispatch({ type: 'UPDATE_SELECTED_TAG', tagId: id })
    },
    [selectedTagIds]
  )

  return (
    <>
      <ul className={checkboxStyles.inlineList}>
        {tags.map((t) => (
          <li key={`filterTag-${t._id}`} className={checkboxStyles.listElement}>
            <Checkbox
              value={t._id}
              onClick={handleTagSelected}
              color={t.color}
              defaultChecked={selectedTagIds.includes(t._id)}
            >
              {t.name}
            </Checkbox>
          </li>
        ))}
        <li>
          <Button onClick={() => setCreateTagVisible(true)}>
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
