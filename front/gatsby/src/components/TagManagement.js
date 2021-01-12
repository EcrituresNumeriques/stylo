import React, { useState } from 'react'

import styles from './tagManagement.module.scss'
import CreateTag from './CreateTag'
import TagManagementSolo from './TagManagementSolo'
import etv from '../helpers/eventTargetValue'
export default (props) => {
  const [creatingTag, setCreatingTag] = useState(false)
  const [filter, setFilter] = useState('')

  return (
    <nav className={props.focus ? styles.expandleft : styles.retractleft}>
      <div>
        <button onClick={props.close}>X</button>

        {creatingTag && (
          <CreateTag
            articles={props.articles}
            triggerReload={() => {
              setCreatingTag(false)
              props.setNeedReload()
            }}
          />
        )}
        <p
          className={styles.button}
          onClick={() => setCreatingTag(!creatingTag)}
        >
          {creatingTag ? 'Cancel new Tag' : 'Create new Tag'}
        </p>

        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(etv(e))}
          placeholder="Search tag"
        />

        {props.tags
          .filter((t) => {
            const index = t.name.indexOf(filter)
            return index !== -1
          })
          .map((t) => (
            <TagManagementSolo
              {...props}
              t={t}
              styles={styles}
              key={'thistag' + t._id}
            />
          ))}
      </div>
    </nav>
  )
}
