import React, { useState } from 'react'

import styles from './tagManagement.module.scss'
import CreateTag from './CreateTag'
import TagManagementSolo from './TagManagementSolo'
import etv from '../helpers/eventTargetValue'
import Button from './Button'
import Field from './Field'
import { Search } from 'react-feather'

export default (props) => {
  const [creatingTag, setCreatingTag] = useState(false)
  const [filter, setFilter] = useState('')

  return (
    <aside className={props.focus ? styles.expandleft : styles.retractleft}>
      <header>
        <Button primary={true} onClick={() => setCreatingTag(!creatingTag)}>
          {creatingTag ? 'Cancel new Tag' : 'Create new Tag'}
        </Button>
        <Button className={styles.closeButton} onClick={props.close}>X</Button>
      </header>
      <main>
        {creatingTag && (
          <CreateTag
            articles={props.articles}
            triggerReload={() => {
              setCreatingTag(false)
              props.setNeedReload()
            }}
          />
        )}
        <Field className={styles.searchField} icon={Search} type="text" value={filter} onChange={(e) => setFilter(etv(e))} placeholder="Search tag"/>
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
