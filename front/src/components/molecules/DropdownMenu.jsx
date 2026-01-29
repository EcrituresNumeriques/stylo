import { EllipsisVertical } from 'lucide-react'
import React from 'react'

import useComponentVisible from '../../hooks/componentVisible.js'
import { Button } from '../atoms/index.js'

import styles from './DropdownMenu.module.scss'

export default function DropdownMenu({ title, children }) {
  const {
    ref: actionsRef,
    isComponentVisible: areActionsVisible,
    toggleComponentIsVisible: toggleActions,
  } = useComponentVisible(false, 'actions')

  return (
    <div className={styles.container} ref={actionsRef}>
      <Button title={title} onClick={() => toggleActions()} icon>
        <EllipsisVertical />
      </Button>

      <div className={styles.menu} hidden={!areActionsVisible}>
        {children}
      </div>
    </div>
  )
}
