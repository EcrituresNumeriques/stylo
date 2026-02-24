import { EllipsisVertical } from 'lucide-react'

import useComponentVisible from '../../hooks/componentVisible.js'
import { Button } from '../atoms/index.js'

import styles from './DropdownMenu.module.scss'

function DropdownEllipsisToggleButton({ title, toggleActions }) {
  return (
    <Button title={title} onClick={() => toggleActions()} icon>
      <EllipsisVertical />
    </Button>
  )
}

/**
 *
 * @param title
 * @param toggleButton
 * @param children
 * @returns {JSX.Element}
 * @constructor
 */
export default function DropdownMenu({ title, toggleButton, children }) {
  const {
    ref: actionsRef,
    isComponentVisible: areActionsVisible,
    toggleComponentIsVisible: toggleActions,
  } = useComponentVisible(false, 'actions')

  const button = toggleButton ?? DropdownEllipsisToggleButton

  return (
    <div className={styles.container} ref={actionsRef}>
      {button({ title, toggleActions })}

      <div className={styles.menu} hidden={!areActionsVisible}>
        {children}
      </div>
    </div>
  )
}
