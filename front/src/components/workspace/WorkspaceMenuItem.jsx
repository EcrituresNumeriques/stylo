import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ChevronRight } from 'react-feather'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import styles from './WorkspaceMenuItem.module.scss'

export default function WorkspaceMenuItem ({ color, name, id  }) {
  const dispatch = useDispatch()
  const setActiveWorkspace = (workspaceId) => {
    dispatch({ type: 'SET_ACTIVE_WORKSPACE', workspaceId })
  }
  const activeUser = useSelector(state => state.activeUser)

  return (
    <>
      <li onClick={() => setActiveWorkspace(id)} className={activeUser.activeWorkspaceId === id ? clsx(styles.item, styles.selected) : styles.item}>
        <span className={styles.chip} style={{ backgroundColor: color }}/>
        <span className={styles.name}>{name}</span>
        <ChevronRight className={styles.chevron}/>
      </li>
    </>
  )
}

WorkspaceMenuItem.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  id: PropTypes.string
}
