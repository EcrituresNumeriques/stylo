import { Button, useInput, useToasts } from '@geist-ui/core'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { randomColor } from '../helpers/colors.js'
import { useGraphQL } from '../helpers/graphQL'
import { useMutate } from '../hooks/graphql'
import { createTag, getTags } from './Tag.graphql'

import styles from './TagCreate.module.scss'
import Field from './Field'
import { useCurrentUser } from '../contexts/CurrentUser'


export default function TagCreate () {
  const { setToast } = useToasts()
  const { data, mutate } = useMutate({ query: getTags, variables: {} })
  const { t } = useTranslation()
  const { state: name, bindings: nameBindings } = useInput('')
  const { state: description, bindings: descriptionBindings } = useInput('')
  const { state: color, bindings: colorBindings } = useInput(randomColor())

  const activeUser = useCurrentUser()
  const runQuery = useGraphQL()

  const variables = {
    user: activeUser._id,
    name,
    description,
    color,
  }

  const handleCreateTag = useCallback((event) => {
    event.preventDefault()
    ;(async () => {
      try {
        const result = await runQuery({
          query: createTag,
          variables
        })
        await mutate({
          user: {
            tags: [...data.user.tags, result.createTag]
          }
        }, { revalidate: false })
      } catch (err) {
        setToast({
          type: 'error',
          text: `Unable to create a new tag: ${err.message}`
        })
      }
    })()
  }, [variables])

  return (
    <section className={styles.create}>
      <form onSubmit={handleCreateTag}>
        <Field
          label={t('tag.createForm.nameField')}
          type="text"
          {...nameBindings}
        />
        <Field
          label={t('tag.createForm.descriptionField')}
          type="text"
          {...descriptionBindings}
        />
        <Field
          label={t('tag.createForm.colorField')}
          type="color"
          {...colorBindings}
        />
        <ul className={styles.actions}>
          <li>
            <Button onClick={handleCreateTag} type="secondary" title={t('tag.createForm.buttonTitle')}>
              {t('tag.createForm.buttonText')}
            </Button>
          </li>
        </ul>
      </form>
    </section>
  )
}

