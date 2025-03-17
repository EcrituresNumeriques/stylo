import { useToasts } from '@geist-ui/core'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '../Button.jsx'
import { randomColor } from '../../helpers/colors.js'
import { useGraphQLClient } from '../../helpers/graphQL.js'
import { fromFormData } from '../../helpers/forms.js'
import useFetchData from '../../hooks/graphql.js'
import { createTag, getTags, updateTag } from '../Tag.graphql'

import styles from './TagEditForm.module.scss'
import Field from '../Field.jsx'

export default function TagEditForm({ tag, onSubmit }) {
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

        <ul className={styles.actions}>
          <li>
            <Button primary={true} title={t('tag.createForm.buttonTitle')}>
              {isNew
                ? t('tag.createForm.buttonText')
                : t('tag.editForm.buttonText')}
            </Button>
          </li>
        </ul>
      </form>
    </section>
  )
}
