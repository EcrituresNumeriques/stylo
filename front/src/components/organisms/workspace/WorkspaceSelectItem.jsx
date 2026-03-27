import clsx from 'clsx'
import { useCallback } from 'react'

import { useGraphQLClient } from '../../../helpers/graphQL.js'
import { useActiveWorkspaceId } from '../../../hooks/workspace.js'

import { addArticle, removeArticle } from '../../../hooks/Workspaces.graphql'

import styles from './WorkspaceSelectItem.module.scss'

/**
 * @param {object} props
 * @param {string} props.articleId
 * @param {string} props.name
 * @param {string} props.color - Workspace hex color
 * @param {boolean} [props.selected]
 * @param {string} [props.id]
 * @param {(event: {workspaceId: string}) => void} [props.onChange]
 * @returns {JSX.Element}
 */
export default function WorkspaceSelectItem({
  articleId,
  selected,
  id,
  color,
  name,
  onChange,
}) {
  const { query } = useGraphQLClient()
  const activeWorkspaceId = useActiveWorkspaceId()

  const toggleWorkspaceArticle = useCallback(
    async (event) => {
      event.preventDefault()
      const [id, checked] = [event.target.value, event.target.checked]
      const graphqlQuery = checked ? addArticle : removeArticle
      await query({
        query: graphqlQuery,
        variables: { articleId: articleId, workspaceId: id },
      })
      onChange({ workspaceId: id })
    },
    [articleId, id]
  )
  return (
    <>
      <li className={activeWorkspaceId === id ? clsx(styles.active) : ''}>
        <label className={clsx(styles.workspace, selected && styles.selected)}>
          <input
            name={id}
            value={id}
            data-id={id}
            type="checkbox"
            checked={selected}
            onChange={toggleWorkspaceArticle}
          />
          <span>{name}</span>
          <span className={styles.chip} style={{ backgroundColor: color }} />
        </label>
      </li>
    </>
  )
}
