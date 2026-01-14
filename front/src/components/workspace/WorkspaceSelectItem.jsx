import clsx from 'clsx'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'

import { useGraphQLClient } from '../../helpers/graphQL.js'
import { useActiveWorkspaceId } from '../../hooks/workspace.js'

import { addArticle, removeArticle } from '../../hooks/Workspaces.graphql'

import styles from './WorkspaceSelectItem.module.scss'

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

WorkspaceSelectItem.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  id: PropTypes.string,
  selected: PropTypes.bool,
  articleId: PropTypes.string.isRequired,
  onChange: PropTypes.func,
}
