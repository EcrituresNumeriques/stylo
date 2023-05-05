import { Button, useInput } from '@geist-ui/core'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { randomColor } from '../helpers/colors.js'
import { useGraphQL } from '../helpers/graphQL'
import { createTag as query } from './Tag.graphql'

import styles from './TagCreate.module.scss'
import Field from './Field'
import { useCurrentUser } from '../contexts/CurrentUser'
import { useDispatch } from 'react-redux'


export default function TagCreate () {
  const { t } = useTranslation()
  const { state: name, bindings: nameBindings } = useInput('')
  const { state: description, bindings: descriptionBindings } = useInput('')
  const { state: color, bindings: colorBindings } = useInput(randomColor())

  const activeUser = useCurrentUser()
  const runQuery = useGraphQL()
  const dispatch = useDispatch()

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
        const { createTag } = await runQuery({
          query,
          variables
        })
        dispatch({ type: 'TAG_CREATED', tag: createTag })
      } catch (err) {
        alert(err)
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
            <Button  onClick={handleCreateTag} type="secondary" title={t('tag.createForm.buttonTitle')}>
              {t('tag.createForm.buttonText')}
            </Button>
          </li>
        </ul>
      </form>
    </section>
  )
}

