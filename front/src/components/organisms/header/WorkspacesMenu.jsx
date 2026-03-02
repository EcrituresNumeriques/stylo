import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { Link, NavLink } from 'react-router'

import useComponentVisible from '../../../hooks/componentVisible.js'
import { usePreferenceItem } from '../../../hooks/user.js'
import {
  useActiveWorkspaceId,
  useWorkspaces,
} from '../../../hooks/workspace.js'
import { Alert, Loading } from '../../molecules/index.js'

import styles from './header.module.scss'

export default function WorkspacesMenu() {
  const { t } = useTranslation()
  const activeWorkspaceId = useActiveWorkspaceId()
  const activeTool = location.pathname.includes('/corpus')
    ? 'corpus'
    : 'articles'
  const dispatch = useDispatch()
  const resetWorkspaceId = useCallback(() => {
    dispatch({ type: 'SET_USER_PREFERENCES', key: 'workspaceId', value: null })
  }, [])
  const {
    ref: workspacesRef,
    isComponentVisible: areWorkspacesVisible,
    toggleComponentIsVisible: toggleWorkspaces,
  } = useComponentVisible(false, 'workspaces')
  const { workspaces, error, isLoading } = useWorkspaces()
  const { setValue: setActiveWorkspaceId } = usePreferenceItem(
    'workspaceId',
    'user'
  )

  return (
    <div ref={workspacesRef}>
      <button
        aria-controls="header-workspaces-list"
        aria-expanded={areWorkspacesVisible}
        onClick={toggleWorkspaces}
      >
        {t('header.mainMenu.workspaces')}
      </button>

      <div
        className={styles.toggleMenuContainer}
        id="header-workspaces-list"
        hidden={!areWorkspacesVisible}
      >
        <ul
          className={styles.toggleMenuList}
          aria-label={t('header.mainMenu.workspaces.list')}
        >
          <li>
            <Link
              to={`/${activeTool}`}
              onClick={resetWorkspaceId}
              aria-current={!activeWorkspaceId ? 'page' : false}
            >
              <span
                className={styles.chip}
                style={{ backgroundColor: '#ccc' }}
              />
              {t('header.mainMenu.workspace.myspace')}
            </Link>
          </li>

          {isLoading && <Loading />}
          {error && <Alert Alert={error.message} />}
          {workspaces.map((workspace) => (
            <li key={workspace._id}>
              <NavLink
                to={`/workspaces/${workspace._id}/${activeTool}`}
                onClick={() => setActiveWorkspaceId(workspace._id)}
                state={{ from: location.pathname }}
              >
                <span
                  className={styles.chip}
                  style={{ backgroundColor: workspace.color }}
                />

                {workspace.name}
              </NavLink>
            </li>
          ))}

          <li>
            <NavLink to={`/workspaces`} end>
              {t('header.mainMenu.workspace.all')}
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  )
}
