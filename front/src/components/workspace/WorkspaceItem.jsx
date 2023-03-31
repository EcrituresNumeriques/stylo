import React from 'react'

import styles from './workspaceItem.module.scss'

export default function WorkspaceItem({workspace}) {


  const workspaceTitle = (
    <>
      <h5 className={styles.title}>
        <span className={styles.chip} style={{backgroundColor: workspace.color}}></span>
        <span className={styles.name}>{workspace.name}</span>
      </h5>
    </>
  )
  return (<div className={styles.container}>
    {workspaceTitle}
    {workspace.personal && <>{workspace.articles.length} articles</> }
    {!workspace.personal && <>
      {workspace._id}

      <div>createdAt: </div>
      {workspace.createdAt}
      <div>updatedAt: </div>
      {workspace.updatedAt}
      {workspace.members.length}
    </>}
  </div>)
}