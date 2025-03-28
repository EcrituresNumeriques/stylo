import { Toggle, useToasts } from '@geist-ui/core'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { fromFormData } from '../../helpers/forms.js'
import { useArticleVersionActions } from '../../hooks/article.js'

import FormActions from '../molecules/FormActions.jsx'

import buttonStyles from '../button.module.scss'
import styles from './createVersion.module.scss'

/**
 * @param props
 * @param {string} props.articleId
 * @param {() => {}} props.onClose
 * @param {() => {}} props.onSubmit
 * @return {Element}
 */
export default function CreateVersion({ articleId, onClose, onSubmit }) {
  const { t } = useTranslation()
  const { setToast } = useToasts()
  const { create } = useArticleVersionActions({ articleId })
  const activeUser = useSelector((state) => state.activeUser)
  const [majorVersion, setMajorVersion] = useState(false)
  const handleCreateVersion = useCallback(
    async (event) => {
      event.preventDefault()
      const details = fromFormData(event.target)
      try {
        await create({
          major: majorVersion,
          description: details.description,
        })
        setToast({
          text: t('write.createVersion.defaultNotification'),
          type: 'default',
        })
        onSubmit()
      } catch (err) {
        const errorMessage =
          err.messages && err.messages.length
            ? err.messages[0].message
            : err.message
        setToast({
          type: 'error',
          text: errorMessage,
        })
      }
    },
    [activeUser, majorVersion]
  )

  return (
    <form
      className={styles.form}
      onSubmit={(e) => handleCreateVersion(e)}
      data-testid="create-version-form"
    >
      <label htmlFor="description">Description</label>
      <textarea
        id="description"
        name="description"
        className={buttonStyles.textarea}
        rows="10"
        style={{ width: '100%', fontFamily: 'Inter' }}
        placeholder={t('write.createVersion.placeholder')}
      ></textarea>
      <div
        className={styles.toggle}
        onClick={() => setMajorVersion(!majorVersion)}
      >
        <Toggle
          id="major-version"
          data-testid="major-version-toggle"
          name="majorVersion"
          checked={majorVersion}
          onChange={(e) => {
            setMajorVersion(e.target.checked)
          }}
        />
        <label htmlFor="major-version">Version majeure</label>
      </div>
      <FormActions
        submitButton={{
          text: t('modal.createButton.text'),
        }}
        onCancel={() => onClose()}
      />
    </form>
  )
}
