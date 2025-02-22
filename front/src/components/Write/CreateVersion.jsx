import { useToasts } from '@geist-ui/core'
import PropTypes from 'prop-types'
import React, { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft } from 'react-feather'
import { createVersion } from '../../services/ArticleService.graphql'
import { useTranslation } from 'react-i18next'

import styles from './createVersion.module.scss'
import buttonStyles from '../button.module.scss'
import Button from '../Button'
import Field from '../Field'
import { useGraphQLClient } from '../../helpers/graphQL.js'

const CreateVersion = ({ articleId, readOnly, onClose }) => {
  const { t } = useTranslation()
  const { setToast } = useToasts()
  const { query } = useGraphQLClient()
  const activeUser = useSelector((state) => state.activeUser)
  const dispatch = useDispatch()
  const [message, setMessage] = useState('')
  const handleCreateVersion = useCallback(
    async (e, major = false) => {
      e.preventDefault()
      try {
        const response = await query({
          query: createVersion,
          variables: {
            userId: activeUser._id,
            articleId,
            major,
            message,
          },
        })
        dispatch({
          type: 'SET_ARTICLE_VERSIONS',
          versions: response.article.createVersion.versions,
        })
        setToast({
          text: t('write.createVersion.defaultNotification'),
          type: 'default',
        })
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
    [message, activeUser]
  )

  return (
    <div className={styles.container}>
      {readOnly && (
        <Link
          className={[buttonStyles.button, buttonStyles.secondary].join(' ')}
          to={`/article/${articleId}`}
        >
          {' '}
          <ArrowLeft /> Edit Mode
        </Link>
      )}
      <form
        className={styles.createForm}
        onSubmit={(e) => handleCreateVersion(e, false)}
      >
        <Field
          className={styles.createVersionInput}
          placeholder={t('write.createVersion.placeholder')}
          value={message}
          autoFocus={true}
          onChange={(e) => setMessage(e.target.value)}
        />
        <ul className={styles.actions}>
          <li className={styles.closeButton}>
            <Button icon={true} onClick={onClose}>
              {t('write.sidebar.closeButton')}
            </Button>
          </li>
          <li>
            <Button primary={true}>
              {t('write.createMinorVersion.Button')}
            </Button>
          </li>
          <li>
            <Button onClick={(e) => handleCreateVersion(e, true)}>
              {t('write.createMajorVersion.Button')}
            </Button>
          </li>
        </ul>
      </form>
    </div>
  )
}

export default CreateVersion

CreateVersion.propTypes = {
  articleId: PropTypes.string,
  readOnly: PropTypes.bool,
  onClose: PropTypes.func,
}
