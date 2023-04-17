import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import styles from './WorkspaceLabel.module.scss'

export default function WorkspaceLabel ({ name, color, className  }) {
  return (
    <>
      <div className={clsx(className, styles.container)}>
        <span className={styles.chip} style={{ backgroundColor: color }}/>
        <span className={styles.name}>{name}</span>
      </div>
    </>
  )
}

WorkspaceLabel.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  className: PropTypes.string
}
