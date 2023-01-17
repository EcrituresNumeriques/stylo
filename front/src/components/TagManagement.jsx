import React, { useState } from 'react'

import styles from './tagManagement.module.scss'
import CreateTag from './CreateTag'
import TagManagementSolo from './TagManagementSolo'
import etv from '../helpers/eventTargetValue'
import Button from './Button'
import Field from './Field'
import { Search, Plus } from 'react-feather'

export default function TagManagement (props) {
  const [creatingTag, setCreatingTag] = useState(false)
  const [filter, setFilter] = useState('')

  return (
    <aside className={props.focus ? styles.expandleft : styles.retractleft}>
      <header>
        <h1 className={styles.headerTitle}>Manage Tags</h1>

        <Button className={styles.closeButton} onClick={props.close}>close</Button>
      </header>
      <main>

        <div className={styles.createAndFilter}>
          <Button primary={true} onClick={() => setCreatingTag(!creatingTag)}>
            <Plus />
            Create new Tag
          </Button>

          {creatingTag && (
            <CreateTag
              cancel={() => setCreatingTag(false)}
              triggerReload={() => {
                setCreatingTag(false)
                props.setNeedReload()
              }}
            />
          )}

          <Field className={styles.searchField} autoFocus={true} icon={Search} type="text" value={filter} onChange={(e) => setFilter(etv(e))} placeholder="Filter on tags"/>
        </div>

        {props.tags
          .filter((t) => t.name.toLocaleLowerCase().indexOf(filter.toLocaleLowerCase()) > -1)
          .map((t) => (
            <TagManagementSolo
              {...props}
              t={t}
              key={'thistag' + t._id}
            />
          ))}
      </main>
    </aside>
  )
}
