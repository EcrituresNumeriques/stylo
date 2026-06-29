import clsx from 'clsx'
import { ArrowLeftIcon, SettingsIcon } from 'lucide-react'
import { useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import {
  Link,
  NavLink,
  useLocation,
  useMatch,
  useNavigate,
  useParams,
} from 'react-router'
import useComponentVisible from '../../../hooks/componentVisible.js'
import { usePreferenceItem } from '../../../hooks/user.js'
import {
  useActiveWorkspace,
  useWorkspaceName,
  useWorkspaces,
} from '../../../hooks/workspace.js'
import { Alert, Loading } from '../../molecules/index.js'

import styles from './header.module.scss'

export default function WorkspacesMenu({ teleportRef }) {
  const { t } = useTranslation()
  const { workspaces, error, isLoading } = useWorkspaces()
  const activeWorkspace = useActiveWorkspace()
  const activeWorkspaceName = useWorkspaceName({ workspace: activeWorkspace })

  const {
    ref: workspacesRef,
    id: menuId,
    isComponentVisible,
    toggleComponentIsVisible,
  } = useComponentVisible({ track: [teleportRef] })

  if (isLoading) {
    return <Loading />
  }
  if (error) {
    return <Alert message={error.message} />
  }

  const renderedSubmenu = (
    <Submenu
      {...{
        activeWorkspace,
        id: menuId,
        isComponentVisible,
        toggleComponentIsVisible,
        workspaces,
      }}
    />
  )

  return (
    <div
      ref={workspacesRef}
      className={clsx(styles.workspacesMenu, styles.list)}
    >
      <button
        aria-controls={menuId}
        aria-expanded={isComponentVisible}
        onClick={toggleComponentIsVisible}
        className={styles.hasDropdown}
        type="button"
        aria-label={t('header.workspaces.menuButton', {
          workspace: activeWorkspaceName,
        })}
      >
        <span
          className={styles.chip}
          style={{ backgroundColor: activeWorkspace?.color ?? '#ccc' }}
        />

        {activeWorkspaceName}
      </button>

      {teleportRef?.current && isComponentVisible
        ? createPortal(renderedSubmenu, teleportRef.current)
        : renderedSubmenu}
    </div>
  )
}

function Submenu({
  activeWorkspace,
  id,
  isComponentVisible,
  toggleComponentIsVisible,
  workspaces,
}) {
  const { t } = useTranslation()
  const { setValue: setWorkspaceIdUserPreference } = usePreferenceItem(
    'workspaceId',
    'user'
  )
  const location = useLocation()
  const routeParams = useParams()
  const navigate = useNavigate()

  const articlesMatch = useMatch('/articles/*')
  const corpusMatch = useMatch('/corpus/*')
  const isPrefixableRoute = Boolean(articlesMatch || corpusMatch)

  const setActiveWorkspaceId = useCallback(
    (workspaceId = '') => {
      console.log({ workspaceId })
      setWorkspaceIdUserPreference(workspaceId)

      if (routeParams.workspaceId && workspaceId) {
        // If there is a workspace in URL, we replace it by a new one
        navigate(
          location.pathname.replace(routeParams.workspaceId, workspaceId)
        )
      } else if (workspaceId && isPrefixableRoute) {
        // If there is no workspace in URL, we might prefix it
        navigate(`/workspaces/${workspaceId}${location.pathname}`)
      } else if (routeParams.workspaceId && !workspaceId) {
        // if there *was* a workspace in URL, we unprefix it
        navigate(
          location.pathname.replace(
            `/workspaces/${routeParams.workspaceId}`,
            ''
          )
        )
      }
    },
    [location.pathname, routeParams, id]
  )

  const resetWorkspaceId = useCallback(() => setActiveWorkspaceId(null), [])

  return (
    <div id={id} hidden={!isComponentVisible}>
      <button
        aria-controls={id}
        className={clsx(styles.toggleMenuButton, styles.hiddenIfDesktop)}
        onClick={toggleComponentIsVisible}
        aria-label={t('header.backButtonLabel')}
        type="button"
      >
        <ArrowLeftIcon aria-hidden className="icon" />
        <span>{t('header.backButton')}</span>
      </button>

      <ul
        className={styles.toggleMenuList}
        aria-label={t('header.workspaces.listLabel')}
      >
        <li>
          <button
            onClick={resetWorkspaceId}
            aria-pressed={!activeWorkspace?._id}
            title={t('header.workspaces.selectButton', {
              workspace: '$t(header.workspaces.myspace)',
              selected: !activeWorkspace?._id,
            })}
            type="button"
          >
            <span className={styles.chip} style={{ backgroundColor: '#ccc' }} />
            {t('header.workspaces.myspace')}
          </button>
        </li>

        {workspaces.map((workspace) => (
          <li key={workspace._id}>
            <button
              onClick={() => setActiveWorkspaceId(workspace._id)}
              aria-pressed={activeWorkspace?._id === workspace._id}
              aria-label={t('header.workspaces.selectButton', {
                workspace: workspace.name,
                selected: activeWorkspace?._id === workspace._id,
              })}
              type="button"
            >
              <span
                className={styles.chip}
                style={{ backgroundColor: workspace.color }}
              />

              {workspace.name}
            </button>
          </li>
        ))}

        <li>
          <NavLink to="/workspaces" end>
            <SettingsIcon aria-hidden className="icon" />
            {t('header.workspaces.settings')}
          </NavLink>
        </li>
      </ul>
    </div>
  )
}
