import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import { removeArticle, addArticle } from './WorkspaceArticle.graphql'
import styles from './WorkspaceSelectItem.module.scss'
import { useGraphQL } from '../../helpers/graphQL.js'

export default function WorkspaceSelectItem ({ articleId, selected, id, color, name, onChange }) {
  const runQuery = useGraphQL()
  const activeUser = useSelector(state => state.activeUser)
  const toggleWorkspaceArticle = useCallback(async (event) => {
    event.preventDefault()
    const [id, checked] = [event.target.value, event.target.checked]
    const query = checked ? addArticle : removeArticle
    await runQuery({ query, variables: { articleId: articleId, workspaceId: id } })
    onChange({workspaceId: id})
  },[articleId, id])
  return (
    <>
      <li className={activeUser.activeWorkspaceId === id ? clsx(styles.active) : ''}>
        <label className={clsx(styles.workspace, selected && styles.selected)}>
          <input name={id} value={id} data-id={id} type="checkbox" checked={selected} onChange={toggleWorkspaceArticle}/>
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
  selected: PropTypes.bool,
  articleId: PropTypes.string.isRequired,
  onChange: PropTypes.func,
}
