import { ChevronDown, Languages } from 'lucide-react'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { Link, NavLink } from 'react-router'

import useComponentVisible from '../../hooks/componentVisible.js'
import { useActiveWorkspaceId, useWorkspaces } from '../../hooks/workspace.js'

import Alert from '../molecules/Alert.jsx'
import Loading from '../molecules/Loading.jsx'
import WorkspaceLabel from '../workspace/WorkspaceLabel.jsx'
import WorkspacesNav from '../workspace/WorkspacesNav.jsx'

import styles from '../header.module.scss'

export default function WorkspacesMenu({ activeTool }) {
  const { workspaces, error, isLoading } = useWorkspaces()
  const { t, i18n } = useTranslation()
  const { ref, isComponentVisible, toggleComponentIsVisible } =
    useComponentVisible(false)
  const activeWorkspaceId = useActiveWorkspaceId()
  const dispatch = useDispatch()
  const resetWorkspaceId = useCallback(() => {
    dispatch({ type: 'SET_USER_PREFERENCES', key: 'workspaceId', value: null })
  }, [])

  if (isLoading) {
    return <Loading />
  }
  if (error) {
    return <Alert Alert={error.message} />
  }

  const workspace = workspaces.find(({ _id }) => _id === activeWorkspaceId)

  return (
    <nav
      ref={ref}
      className={styles.dropdownMenu}
      aria-labelledby="workspaces-selection"
      aria-description={t('header.workspacesMenu.description')}
    >
      <button
        id="workspaces-selection"
        aria-expanded={isComponentVisible}
        aria-controls="header-workspaces-menu"
        onClick={toggleComponentIsVisible}
        className={styles.toggleMenu}
      >
        <WorkspaceLabel workspace={workspace} />
        <ChevronDown />
      </button>

      <div
        className={styles.toggleMenuContainerAlignEnd}
        id="header-workspaces-menu"
        hidden={!isComponentVisible}
      >
        <ul
          className={styles.toggleMenuList}
          aria-label={t('header.workspacesMenu.list')}
        >
          <Link
            to={`/${activeTool}`}
            onClick={resetWorkspaceId}
            aria-current={!activeWorkspaceId ? 'page' : false}
          >
            <span className={styles.chip} style={{ backgroundColor: '#ccc' }} />
            {t('workspace.myspace')}
          </Link>
          <WorkspacesNav activeTool={activeTool} />
          <NavLink to={`/workspaces`} end>
            {t('workspace.all')}
          </NavLink>
        </ul>
      </div>
    </nav>
  )
}
