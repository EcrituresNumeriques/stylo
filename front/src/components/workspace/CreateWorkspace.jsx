import { Button, useInput } from '@geist-ui/core'
import React, { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'

import Field from '../Field.jsx'

import styles from './createWorkspace.module.scss'
import { randomColor } from '../../helpers/colors.js'

export default function CreateWorkspace () {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { state: name, bindings: nameBindings } = useInput('')
  const { state: description, bindings: descriptionBindings } = useInput('')
  const { state: color, bindings: colorBindings } = useInput(randomColor())
  const nameInputRef = useRef()

  const handleSubmit = useCallback(async () => {
    dispatch({type: 'CREATE_WORKSPACE', data: {name, color, description}})
  }, [name, color, description])

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <Field
          ref={nameInputRef}
          {...nameBindings}
          label={t('workspace.createForm.nameField')}
          type="text"
          className={styles.nameField}
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
            <Button type="secondary"
                    className={styles.button}
                    title={t('workspace.createForm.buttonTitle')}
                    onClick={handleSubmit}>{t('workspace.createForm.buttonText')}
            </Button>
          </li>
        </ul>
      </form>
    </section>
  )
}
