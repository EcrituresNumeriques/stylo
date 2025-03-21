import { useToasts } from '@geist-ui/core'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { randomColor } from '../../helpers/colors.js'
import { fromFormData } from '../../helpers/forms.js'
import { useGraphQLClient } from '../../helpers/graphQL.js'
import useFetchData from '../../hooks/graphql.js'
import Field from '../Field.jsx'
import FormActions from '../molecules/FormActions.jsx'
import { createTag, getTags, updateTag } from '../Tag.graphql'

import styles from './TagEditForm.module.scss'

/**
 * @param props
 * @param {any|null} props.tag
 * @param {function} props.onSubmit
 * @param {function} props.onCancel
 * @return {Element}
 */
export default function TagEditForm({ tag, onSubmit, onCancel }) {
  const { setToast } = useToasts()
  const { data, mutate } = useFetchData({ query: getTags, variables: {} })
  const { t } = useTranslation()

  const { query } = useGraphQLClient()
  const isNew = Boolean(!tag?._id)

  const title = isNew ? t('tag.editForm.title') : t('tag.createForm.title')

  const handleTagFormSubmit = useCallback(async (event) => {
    event.preventDefault()

    const variables = {
      ...fromFormData(event.target),
      tag: tag?._id ?? null,
    }

    const result = await query({
      query: isNew ? createTag : updateTag,
      variables,
    })

    await mutate(
      {
        user: {
          tags: isNew
            ? [...data.user.tags, result.createTag]
            : data.user.tags.map((tag) => {
                return tag._id === result.updateTag._id ? result.updateTag : tag
              }),
        },
      },
      { revalidate: false }
    )

    onSubmit(result.updateTag ?? result.createTag)
    setToast({
      text: t(`tag.${isNew ? 'createForm' : 'editForm'}.successNotification`),
      type: 'default',
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
