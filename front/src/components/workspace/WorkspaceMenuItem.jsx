import React from 'react'
import { useDispatch } from 'react-redux'
import { ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import PropTypes from 'prop-types'
import { useLocation, useNavigate } from 'react-router'

import { useActiveWorkspaceId } from '../../hooks/workspace.js'

import styles from './WorkspaceMenuItem.module.scss'

export default function WorkspaceMenuItem({ color, name, id }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const activeWorkspaceId = useActiveWorkspaceId()

  const setActiveWorkspace = (workspaceId) => {
    const path = location.pathname
    if (path.endsWith('/corpus')) {
      if (id) {
        navigate(`/workspaces/${id}/corpus`)
      } else {
        navigate(`/corpus`)
      }
    } else {
      if (id) {
        navigate(`/workspaces/${id}/articles`)
      } else {
        navigate(`/articles`)
      }
    }
    dispatch({ type: 'SET_ACTIVE_WORKSPACE', workspaceId })
  }


  return (
    <>
      <li
        onClick={() => setActiveWorkspace(id)}
        className={
          activeWorkspaceId === id
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
