import React from 'react'

import styles from './workspaceItem.module.scss'

export default function WorkspaceItem({workspace}) {
  return (<div className={styles.container}>
    <h5 className={styles.title}>{workspace.name}</h5>
    {workspace.personal && <>{workspace.articles.length} articles</> }
    {!workspace.personal && <>
      {workspace._id}
      {workspace.color}
      {workspace.createdAt}
      {workspace.updatedAt}
      {workspace.members.length}
    </>}
  </div>)
}