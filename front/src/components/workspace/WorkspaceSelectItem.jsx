import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import { removeArticle, addArticle } from './WorkspaceArticle.graphql'
import styles from './WorkspaceSelectItem.module.scss'
import { useGraphQL } from '../../helpers/graphQL.js'

export default function WorkspaceSelectItem ({ articleId, color, name, id, workspaceIds, onChange }) {
  const dispatch = useDispatch()
  const runQuery = useGraphQL()
  const activeUser = useSelector(state => state.activeUser)
  const isSelected = workspaceIds.includes(id)
  const toggleWorkspaceArticle = useCallback(async (event) => {
    event.preventDefault()
    const [id, checked] = [event.target.value, event.target.checked]
    const [query, updatedWorkspaceIds] = checked
      ? [addArticle, [...workspaceIds, id]]
      : [removeArticle, workspaceIds.filter(v => v !== id)]
    await runQuery({ query, variables: { articleId: articleId, workspaceId: id } })
    if (isSelected) {
      // remove
      if (activeUser.activeWorkspaceId === id) {
        // article removed from active workspace!
        // dispatch()
      }
    }
    onChange(updatedWorkspaceIds)
  },[articleId, id, workspaceIds])
  return (
    <>
      <li className={activeUser.activeWorkspaceId === id ? clsx(styles.active) : ''}>
        <label className={clsx(styles.workspace, isSelected && styles.selected)}>
          <input name={id} value={id} data-id={id} type="checkbox" checked={isSelected} onChange={toggleWorkspaceArticle}/>
          <span>{name}</span>
          <span className={styles.chip} style={{ backgroundColor: color }}/>
        </label>
      </li>
    </>
  )
}

WorkspaceSelectItem.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  id: PropTypes.string,
  workspaceIds: PropTypes.array,
  articleId: PropTypes.string.isRequired,
  onChange: PropTypes.func,
}
