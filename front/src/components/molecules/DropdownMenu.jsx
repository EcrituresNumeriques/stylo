import { EllipsisVertical } from 'lucide-react'

import useComponentVisible from '../../hooks/componentVisible.js'
import { Button } from '../atoms/index.js'

import styles from './DropdownMenu.module.scss'

function DropdownEllipsisToggleButton({ title, toggleActions, isOpen }) {
  return (
    <Button
      title={title}
      onClick={() => toggleActions()}
      aria-expanded={isOpen}
      icon
    >
      <EllipsisVertical />
    </Button>
  )
}

/**
 * @param {object} props
 * @param {string} props.title
 * @param {function(object): JSX.Element} props.toggleButton
 * @param {JSX.Element} props.children
 * @returns {JSX.Element}
 */
export default function DropdownMenu({ title, toggleButton, children }) {
  const {
    ref: actionsRef,
    isComponentVisible: areActionsVisible,
    toggleComponentIsVisible: toggleActions,
  } = useComponentVisible()

  const button = toggleButton ?? DropdownEllipsisToggleButton

  return (
    <div className={styles.container} ref={actionsRef}>
      {button({ title, toggleActions, isOpen: areActionsVisible })}

      <div className={styles.menu} hidden={!areActionsVisible}>
        {children}
      </div>
    </div>
  )
}
