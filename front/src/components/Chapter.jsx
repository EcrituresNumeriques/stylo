import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Check, Edit3 } from 'react-feather'

import askGraphQL from '../helpers/graphQL'
import Button from './Button'
import buttonStyles from './button.module.scss'
import styles from './chapter.module.scss'
import Field from './Field'

const mapStateToProps = ({ activeUser, sessionToken, applicationConfig }) => {
  return { activeUser, sessionToken, applicationConfig }
}

const ConnectedChapter = ({ articleId, latestArticleVersion, articleTitle, activeUser, sessionToken, applicationConfig }) => {
  const [renaming, setRenaming] = useState(false)
  const [title, setTitle] = useState(articleTitle)
  const [tempTitle, setTempTitle] = useState(articleTitle)
  const userId = activeUser._id

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
    await askGraphQL(
      { query, variables },
      'Renaming Article',
      sessionToken,
      applicationConfig
    )
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
          setTempTitle(articleTitle)
        }}>
          Cancel
        </Button>
      </form>)}
    </>
  )
}

const Chapter = connect(mapStateToProps)(ConnectedChapter)
export default Chapter
