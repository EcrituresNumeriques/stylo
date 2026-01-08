import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { fromFormData } from '../../../helpers/forms.js'
import {
  useArticleActions,
  useArticlesActions,
} from '../../../hooks/article.js'
import { useConditionalFetchData } from '../../../hooks/graphql.js'
import { useUserTags } from '../../../hooks/user.js'
import { useWorkspaces } from '../../../hooks/workspace.js'

import Checkbox from '../../atoms/Checkbox.jsx'
import Field from '../../atoms/Field.jsx'
import Alert from '../../molecules/Alert.jsx'
import FormActions from '../../molecules/FormActions.jsx'
import Loading from '../../molecules/Loading.jsx'

import { getArticleWorkspaces } from '../../../hooks/Workspaces.graphql'

import checkboxStyles from '../../atoms/Checkbox.module.scss'
import formStyles from '../../atoms/Field.module.scss'

/**
 * @typedef {object} ArticleCreateProps
 * @property {Function=} onSubmit
 * @property {string=} workspaceId
 */

/**
 * @param {object} props
 * @param {Function} props.onSubmit
 * @param {Function} props.onCancel
 * @param {string|undefined} props.workspaceId
 * @returns {React.ReactHTMLElement}
 */
export default function ArticleForm({
  article,
  onSubmit,
  onCancel,
  workspaceId,
}) {
  const { t } = useTranslation()

  const { create } = useArticlesActions({ activeWorkspaceId: workspaceId })
  const { update } = useArticleActions({
    articleId: article?._id,
    activeWorkspaceId: workspaceId,
  })

  const action = useMemo(
    () => (article === undefined ? 'create' : 'update'),
    [article]
  )

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()
    try {
      const formInput = fromFormData(event.target)
      if (article !== undefined) {
        await update(article, {
          tags: [],
          workspaces: [],
          ...formInput,
        })
        onSubmit()
      } else {
        await create(formInput)
        onSubmit()
      }
      toast(t(`article.${action}.successNotification`), {
        type: 'info',
      })
    } catch (err) {
      console.log({ err })
      toast(
        t(`article.${action}.errorNotification`, { errMessage: err.message }),
        {
          type: 'error',
        }
      )
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
          defaultValue={article?.title}
        />

        <TagsField defaultValues={article?.tags?.map((t) => t._id)} />
        <WorkspacesField articleId={article?._id} workspaceId={workspaceId} />

        <FormActions
          onCancel={onCancel}
          submitButton={{
            text: t(`article.${action}Form.buttonText`),
            title: t(`article.${action}Form.buttonText`),
          }}
        />
      </form>
    </section>
  )
}

function WorkspacesField({ workspaceId, articleId }) {
  const { t } = useTranslation()
  const { workspaces, error, isLoading } = useWorkspaces()
  const {
    data,
    isLoading: isLoadingArticleWorkspaces,
    error: errorLoadingArticleWorkspaces,
  } = useConditionalFetchData(
    articleId
      ? { query: getArticleWorkspaces, variables: { articleId } }
      : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      fallbackData: {
        article: {
          workspaces: [],
        },
      },
    }
  )

  if (error) {
    return <Alert message={error.message} />
  }
  if (errorLoadingArticleWorkspaces) {
    return <Alert message={errorLoadingArticleWorkspaces.message} />
  }
  if (isLoading || isLoadingArticleWorkspaces) {
    return <Loading />
  }

  const defaultValues = data.article.workspaces.map((w) => w._id)
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
                defaultChecked={
                  workspaceId === workspace._id ||
                  defaultValues.includes(workspace._id)
                }
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

function TagsField({ defaultValues = [] }) {
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
              <Checkbox
                name="tags[]"
                value={t._id}
                color={t.color}
                defaultChecked={defaultValues.includes(t._id)}
              >
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
