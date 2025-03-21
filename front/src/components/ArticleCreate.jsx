import { useToasts } from '@geist-ui/core'
import React, { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { useGraphQLClient } from '../helpers/graphQL'
import { createArticle } from './Articles.graphql'
import Field from './Field.jsx'
import FormActions from './molecules/FormActions.jsx'
import { getTags } from './Tag.graphql'
import Checkbox from './Checkbox.jsx'

import formStyles from './field.module.scss'
import checkboxStyles from './Checkbox.module.scss'
import { fromFormData } from '../helpers/forms.js'

/**
 * @typedef {Object} ArticleCreateProps
 * @property {function=} onSubmit
 * @property {string=} workspaceId
 */

/**
 * @param props
 * @param {function} props.onSubmit
 * @param {function} props.onCancel
 * @param {string|null} props.workspaceId
 * @returns {React.ReactHTMLElement}
 */
export default function ArticleCreate({
  onSubmit,
  onCancel,
  workspaceId = null,
}) {
  const { t } = useTranslation()
  const { setToast } = useToasts()

  const [tags, setTags] = useState([])
  const { query } = useGraphQLClient()
  const workspaces = useSelector((state) => state.activeUser.workspaces)

  useEffect(() => {
    // Self invoking async function
    ;(async () => {
      try {
        const {
          user: { tags },
        } = await query({ query: getTags, variables: {} })
        setTags(tags)
      } catch (err) {
        setToast({
          text: t('article.getTags.error', { errMessage: err }),
          type: 'error',
        })
      }
    })()
  }, [])

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()
    try {
      const createArticleInput = fromFormData(event.target)
      const { createArticle: createdArticle } = await query({
        query: createArticle,
        variables: { createArticleInput },
      })
      onSubmit(createdArticle)
      setToast({
        text: t('article.create.successNotification'),
        type: 'default',
      })
    } catch (err) {
      setToast({
        text: t('article.create.errorNotification', { errMessage: err }),
        type: 'error',
      })
    }
  }, [])

  return (
    <section>
      <form onSubmit={handleSubmit} className={formStyles.form}>
        <Field
          autoFocus={true}
          label={t('article.createForm.titleField')}
          type="text"
          name="title"
          required={true}
        />

        {tags.length > 0 && (
          <div>
            <span className={formStyles.fieldLabel}>
              {t('article.createForm.tagsField')}
            </span>

            <ul className={checkboxStyles.inlineList}>
              {tags.map((t) => (
                <li key={`selectTag-${t._id}`}>
                  <Checkbox name="tags[]" value={t._id} color={t.color}>
                    {t.name}
                  </Checkbox>
                </li>
              ))}
            </ul>
          </div>
        )}

        {workspaces.length > 0 && (
          <div>
            <span className={formStyles.fieldLabel}>
              {t('workspace.title')}
            </span>

            <ul className={checkboxStyles.inlineList}>
              {workspaces.map((workspace) => (
                <li key={`selectWorkspace-${workspace._id}`}>
                  <Checkbox
                    name="workspaces[]"
                    value={workspace._id}
                    color={workspace.color}
                    defaultChecked={workspaceId === workspace._id}
                  >
                    {workspace.name}
                  </Checkbox>
                </li>
              ))}
            </ul>
          </div>
        )}
        <FormActions
          onCancel={onCancel}
          submitButton={{
            text: t('article.createForm.buttonText'),
            title: t('article.createForm.buttonText'),
          }}
        />
      </form>
    </section>
  )
}
