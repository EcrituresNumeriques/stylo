import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { useGraphQLClient } from '../helpers/graphQL'

import { fromFormData } from '../helpers/forms.js'
import { useUserTags } from '../hooks/user.js'
import { useWorkspaces } from '../hooks/workspace.js'

import Checkbox from './Checkbox.jsx'
import Field from './Field.jsx'
import Alert from './molecules/Alert.jsx'
import FormActions from './molecules/FormActions.jsx'
import Loading from './molecules/Loading.jsx'

import { createArticle } from './Articles.graphql'

import checkboxStyles from './Checkbox.module.scss'
import formStyles from './field.module.scss'

/**
 * @typedef {object} ArticleCreateProps
 * @property {Function=} onSubmit
 * @property {string=} workspaceId
 */

/**
 * @param {object} props
 * @param {Function} props.onSubmit
 * @param {Function} props.onCancel
 * @param {string|null} props.workspaceId
 * @returns {React.ReactHTMLElement}
 */
export default function ArticleCreate({
  onSubmit,
  onCancel,
  workspaceId = null,
}) {
  const { t } = useTranslation()

  const { query } = useGraphQLClient()

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()
    try {
      const createArticleInput = fromFormData(event.target)
      const { createArticle: createdArticle } = await query({
        query: createArticle,
        variables: { createArticleInput },
      })
      onSubmit(createdArticle)
      toast(t('article.create.successNotification'), {
        type: 'info',
      })
    } catch (err) {
      toast(t('article.create.errorNotification', { errMessage: err }), {
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

        <TagsField />
        <WorkspacesField workspaceId={workspaceId} />

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

function WorkspacesField({ workspaceId }) {
  const { t } = useTranslation()
  const { workspaces, error, isLoading } = useWorkspaces()
  if (error) {
    return <Alert message={error.message} />
  }
  if (isLoading) {
    return <Loading />
  }

  if (workspaces.length > 0) {
    return (
      <div>
        <span className={formStyles.fieldLabel}>{t('workspace.title')}</span>

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
    )
  }

  return <></>
}

function TagsField() {
  const { t } = useTranslation()
  const { tags, error, isLoading } = useUserTags()
  if (error) {
    return <Alert message={error.message} />
  }
  if (isLoading) {
    return <Loading />
  }

  if (tags.length > 0) {
    return (
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
    )
  }

  return <></>
}
