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
