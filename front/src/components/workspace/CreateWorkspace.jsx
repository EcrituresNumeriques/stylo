import { Button, useInput } from '@geist-ui/core'
import React, { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { shallowEqual, useSelector } from 'react-redux'
import { useWorkspaceActions } from '../../hooks/workspace.js'

import Field from '../Field.jsx'

import styles from './createWorkspace.module.scss'
import { randomColor } from '../../helpers/colors.js'

export default function CreateWorkspace({ onSubmit }) {
  const { t } = useTranslation()
  const { state: name, bindings: nameBindings } = useInput('')
  const { state: description, bindings: descriptionBindings } = useInput('')
  const { state: color, bindings: colorBindings } = useInput(randomColor())
  const nameInputRef = useRef()
  const currentUser = useSelector((state) => state.activeUser, shallowEqual)
  const { addWorkspace } = useWorkspaceActions()

  const handleSubmit = useCallback(async () => {
    await addWorkspace({
      name,
      color,
      description,
      updatedAt: new Date().getTime(),
      createdAt: new Date().getTime(),
      stats: {
        membersCount: 1,
        articlesCount: 0,
      },
      creator: currentUser,
    })
    onSubmit()
  }, [name, color, description])

  return (
    <section>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Field
          autoFocus={true}
          ref={nameInputRef}
          {...nameBindings}
          label={t('workspace.createForm.nameField')}
          type="text"
          className={styles.name}
        />
        <Field
          label={t('workspace.createForm.descriptionField')}
          type="text"
          {...descriptionBindings}
        />
        <Field
          label={t('workspace.createForm.colorField')}
          type="color"
          {...colorBindings}
        />
        <ul className={styles.actions}>
          <li>
            <Button
              type="secondary"
              className={styles.button}
              title={t('workspace.createForm.buttonTitle')}
              onClick={handleSubmit}
            >
              {t('workspace.createForm.buttonText')}
            </Button>
          </li>
        </ul>
      </form>
    </section>
  )
}
