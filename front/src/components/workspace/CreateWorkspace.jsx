import { useInput } from '@geist-ui/core'
import React, { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { shallowEqual, useSelector } from 'react-redux'
import { randomColor } from '../../helpers/colors.js'
import { useWorkspaceActions } from '../../hooks/workspace.js'

import Field from '../Field.jsx'
import FormActions from '../molecules/FormActions.jsx'

import styles from './createWorkspace.module.scss'

/**
 * @param {Object} props
 * @param {Function} props.onSubmit
 * @param {Function} props.onCancel
 * @return {JSX.Element}
 */
export default function CreateWorkspace({ onSubmit, onCancel }) {
  const { t } = useTranslation()
  const { state: name, bindings: nameBindings } = useInput('')
  const { state: description, bindings: descriptionBindings } = useInput('')
  const { state: color, bindings: colorBindings } = useInput(randomColor())
  const nameInputRef = useRef(null)
  const currentUser = useSelector((state) => state.activeUser, shallowEqual)
  const { addWorkspace } = useWorkspaceActions()

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      await addWorkspace({
        name,
        color,
        description,
      })
      onSubmit()
    },
    [name, color, description]
  )

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
        <FormActions
          onCancel={onCancel}
          submitButton={{
            text: t('workspace.createForm.buttonText'),
            title: t('workspace.createForm.buttonTitle'),
          }}
        />
      </form>
    </section>
  )
}
