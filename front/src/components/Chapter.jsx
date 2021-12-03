import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Check, Edit3 } from 'react-feather'

import { useGraphQL } from '../helpers/graphQL'
import Button from './Button'
import buttonStyles from './button.module.scss'
import styles from './chapter.module.scss'
import Field from './Field'

export default function Chapter ({ article }) {
  const articleId = article._id
  const latestVersion = article.versions && article.versions[0]
  const latestArticleVersion = latestVersion && {
    message: latestVersion.message,
    major: latestVersion.version,
    minor: latestVersion.revision
  }

  const [renaming, setRenaming] = useState(false)
  const [title, setTitle] = useState(article.title)
  const [tempTitle, setTempTitle] = useState(article.title)
  const userId = useSelector(state => state.activeUser._id)
  const runQuery = useGraphQL()

  const rename = async (e) => {
    e.preventDefault()
    const query = `mutation($article:ID!, $title:String!, $user:ID!) {
  renameArticle(article:$article, title:$title, user:$user) {
    title
  }
}`
    const variables = {
      user: userId,
      article: articleId,
      title: tempTitle,
    }
    await runQuery({ query, variables })
    setTitle(tempTitle)
    setRenaming(false)
  }
  const latestArticleVersionLabel = latestArticleVersion
    ? latestArticleVersion.message || 'No label'
    : ''
  const latestVersionVersionNumber = latestArticleVersion
    ? `v${latestArticleVersion.major}.${latestArticleVersion.minor}`
    : 'latest'
  const currentArticleVersionTitle = ` (${[latestArticleVersionLabel, latestVersionVersionNumber].filter(item => item).join(' ')})`
  return (
    <>
      {!renaming && (
        <p>
          <Link to={`/article/${articleId}`}>{title}{currentArticleVersionTitle}</Link>
          <Button className={[buttonStyles.icon, styles.renameButton].join(' ')} onClick={() => setRenaming(true)}>
            <Edit3/>
          </Button>
        </p>
      )}
      {renaming && renaming && (<form className={styles.renamingForm} onSubmit={(e) => rename(e)}>
        <Field autoFocus={true} type="text" value={tempTitle} onChange={(e) => setTempTitle(e.target.value)} placeholder="Book Title" />
        <Button title="Save" primary={true} onClick={(e) => rename(e)}>
          <Check /> Save
        </Button>
        <Button title="Cancel" type="button" onClick={() => {
          setRenaming(false)
          setTempTitle(article.title)
        }}>
          Cancel
        </Button>
      </form>)}
    </>
  )
}
