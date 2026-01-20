import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { randomColor } from '../../helpers/colors.js'
import { fromFormData } from '../../helpers/forms.js'
import { useUserTagActions } from '../../hooks/user.js'

import Field from '../atoms/Field.jsx'
import FormActions from '../molecules/FormActions.jsx'

import styles from './TagEditForm.module.scss'

/**
 * @param props
 * @param {any|null} props.tag
 * @param {function} props.onSubmit
 * @param {function} props.onCancel
 * @return {Element}
 */
export default function TagEditForm({ tag, onSubmit, onCancel }) {
  const { create, update } = useUserTagActions()
  const { t } = useTranslation()

  const isNew = Boolean(!tag?._id)

  const title = isNew ? t('tag.editForm.title') : t('tag.createForm.title')

  const handleTagFormSubmit = useCallback(async (event) => {
    event.preventDefault()
    const data = {
      ...fromFormData(event.target),
      tag: tag?._id ?? null,
    }
    const result = isNew ? await create(data) : await update(data)
    onSubmit(result)
    toast(t(`tag.${isNew ? 'createForm' : 'editForm'}.successNotification`), {
      type: 'info',
    })
  }, [])

  return (
    <section className={styles.create}>
      <form onSubmit={handleTagFormSubmit} name={title}>
        <Field
          autoFocus={true}
          label={t('tag.createForm.nameField')}
          type="text"
          name="name"
          required
          defaultValue={tag?.name}
        />
        <Field
          label={t('tag.createForm.descriptionField')}
          type="text"
          name="description"
          defaultValue={tag?.description}
        />
        <Field
          label={t('tag.createForm.colorField')}
          type="color"
          name="color"
          defaultValue={tag?.color ?? randomColor()}
        />

        <FormActions
          onCancel={onCancel}
          submitButton={{
            title: t('tag.createForm.buttonTitle'),
            text: isNew
              ? t('tag.createForm.buttonText')
              : t('tag.editForm.buttonText'),
          }}
        />
      </form>
    </section>
  )
}
