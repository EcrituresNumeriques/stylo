import React from 'react'
import { ChevronRight } from 'react-feather'
import clsx from 'clsx'
import PropTypes from 'prop-types'
import { useLocation, useHistory } from 'react-router-dom'
import { getActions, useActiveWorkspace } from '../../stores/workspaceStore.jsx'

import styles from './WorkspaceMenuItem.module.scss'

export default function WorkspaceMenuItem({ color, name, id }) {
  const history = useHistory()
  const location = useLocation()
  const { setActiveWorkspaceId } = getActions()
  const activeWorkspace = useActiveWorkspace()

  const updateActiveWorkspace = (workspaceId) => {
    const path = location.pathname
    if (path.endsWith('/books')) {
      if (id) {
        history.push(`/workspaces/${id}/books`)
      } else {
        history.push(`/books`)
      }
    } else {
      if (id) {
        history.push(`/workspaces/${id}/articles`)
      } else {
        history.push(`/articles`)
      }
    }
    setActiveWorkspaceId(workspaceId)
  }
  return (
    <>
      <li
        onClick={() => updateActiveWorkspace(id)}
        className={
          activeWorkspace?._id === id
            ? clsx(styles.item, styles.selected)
            : styles.item
        }
      >
        <span className={styles.chip} style={{ backgroundColor: color }} />
        <span className={styles.name}>{name}</span>
        <ChevronRight className={styles.chevron} />
      </li>
    </>
  )
}

WorkspaceMenuItem.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  id: PropTypes.string,
}
