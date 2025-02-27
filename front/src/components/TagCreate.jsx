import { Button, useInput, useToasts } from '@geist-ui/core'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { randomColor } from '../helpers/colors.js'

import styles from './TagCreate.module.scss'
import Field from './Field'
import { useCurrentUser } from '../contexts/CurrentUser'
import { useUserTagActions } from '../hooks/user.js'

export default function TagCreate() {
  const { setToast } = useToasts()
  const { create: createTag } = useUserTagActions()
  const { t } = useTranslation()
  const { state: name, bindings: nameBindings } = useInput('')
  const { state: description, bindings: descriptionBindings } = useInput('')
  const { state: color, bindings: colorBindings } = useInput(randomColor())

  const activeUser = useCurrentUser()
  const tag = {
    user: activeUser._id,
    name,
    description,
    color,
  }

  const handleCreateTag = useCallback(
    (event) => {
      event.preventDefault()
      ;(async () => {
        try {
          await createTag(tag)
        } catch (err) {
          setToast({
            type: 'error',
            text: `Unable to create a new tag: ${err.message}`,
          })
        }
      })()
    },
    [tag]
  )

  return (
    <section className={styles.create}>
      <form onSubmit={handleCreateTag}>
        <Field
          autoFocus={true}
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
            <Button
              onClick={handleCreateTag}
              type="secondary"
              title={t('tag.createForm.buttonTitle')}
            >
              {t('tag.createForm.buttonText')}
            </Button>
          </li>
        </ul>
      </form>
    </section>
  )
}
