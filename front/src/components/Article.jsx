import React, { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

import styles from './articles.module.scss'
import buttonStyles from './button.module.scss'
import fieldStyles from './field.module.scss'

import Modal from './Modal'
import Export from './Export'
import ArticleDelete from './ArticleDelete'
import ArticleTags from './ArticleTags'
import Share from './Share'

import formatTimeAgo from '../helpers/formatTimeAgo'
import etv from '../helpers/eventTargetValue'

import Field from './Field'
import Button from './Button'
import { Check, ChevronDown, ChevronRight, Copy, Edit3, Eye, Printer, Share2, Trash } from 'react-feather'

import { duplicateArticle } from './Acquintances.graphql'
import { renameArticle, getArticleVersions } from './Article.graphql'
import { useGraphQL } from '../helpers/graphQL'
import { useCurrentUser } from '../contexts/CurrentUser'

export default function Article ({ article, setNeedReload, updateTitleHandler, updateTagsHandler, userTags }) {
  const [expanded, setExpanded] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [tags, setTags] = useState(article.tags)
  const [renaming, setRenaming] = useState(false)
  const [title, setTitle] = useState(article.title)
  const [versions, setVersions] = useState(article.versions || [])
  const [tempTitle, setTempTitle] = useState(article.title)
  const [sharing, setSharing] = useState(false)
  const runQuery = useGraphQL()
  const activeUser = useCurrentUser()

  const isArticleOwner = activeUser._id === article.owner._id
  const contributors = article.contributors.filter(c => c.user._id !== article.owner._id)
  const handleTagUpdate = useCallback(tags => {
    setTags(tags)
    updateTagsHandler(article._id, tags)
  }, [])

  useEffect(() => {
    (async () => {
      if (expanded) {
        try {
          const data = await runQuery({ query: getArticleVersions, variables: { articleId: article._id } })
          setVersions(data.article.versions)
        } catch (err) {
          alert(err)
        }
      }
    })()
  }, [expanded])

  const toggleExpansion = useCallback((event) => {
    if (!event.key || [' ', 'Enter'].includes(event.key)) {
      setExpanded(!expanded)
    }
  }, [expanded])

  const fork = useCallback(async () => {
    try {
      await runQuery({
        query: duplicateArticle,
        variables: { article: article._id, user: activeUser._id, to: activeUser._id }
      })
      setNeedReload()
    } catch (err) {
      console.error(`Unable to duplicate article ${article._id} with myself (userId: ${activeUser._id})`, err)
      alert(err)
    }
  }, [])

  const rename = useCallback(async (e) => {
    e.preventDefault()
    const variables = {
      user: activeUser._id,
      article: article._id,
      title: tempTitle,
    }
    await runQuery({ query: renameArticle, variables })
    setTitle(tempTitle)
    setRenaming(false)
    if (updateTitleHandler) {
      updateTitleHandler(article._id, tempTitle)
    }
  }, [tempTitle])

  return (
    <article className={styles.article}>
      {exporting && (
        <Modal title="Export" cancel={() => setExporting(false)}>
          <Export articleId={article._id} bib={article.workingVersion.bibPreview} name={article.title}/>
        </Modal>
      )}

      {sharing && (
        <Modal title="Share with Stylo users" cancel={() => setNeedReload() || setSharing(false)}>
          <Share article={article} setNeedReload={setNeedReload} cancel={() => setSharing(false)}/>
        </Modal>
      )}

      {!renaming && (
        <h1 className={styles.title} onClick={toggleExpansion}>
          <span tabIndex={0} onKeyUp={toggleExpansion} className={styles.icon}>
            {expanded ? <ChevronDown/> : <ChevronRight/>}
          </span>

          {title}

          <Button title="Edit" icon={true} className={styles.editTitleButton}
                  onClick={(evt) => evt.stopPropagation() || setRenaming(true)}>
            <Edit3 size="20"/>
          </Button>
        </h1>
      )}
      {renaming && (
        <form className={clsx(styles.renamingForm, fieldStyles.inlineFields)} onSubmit={(e) => rename(e)}>
          <Field autoFocus={true} type="text" value={tempTitle} onChange={(e) => setTempTitle(etv(e))}
                 placeholder="Article Title"/>
          <Button title="Save" primary={true} onClick={(e) => rename(e)}>
            <Check/> Save
          </Button>
          <Button title="Cancel" type="button" onClick={() => {
            setRenaming(false)
            setTempTitle(article.title)
          }}>
            Cancel
          </Button>
        </form>
      )}

      <aside className={styles.actionButtons}>
        {isArticleOwner &&
          <Button title={contributors.length ? 'Remove all contributors in order to delete this article' : 'Delete'}
                  disabled={contributors.length > 0} icon={true} onClick={() => setDeleting(true)}>
            <Trash/>
          </Button>}

        <Button title="Duplicate" icon={true} onClick={() => fork()}>
          <Copy/>
        </Button>

        {<Button title="Share with Stylo users" icon={true} onClick={() => setSharing(true)}>
          <Share2/>
        </Button>}

        <Button title="Download a printable version" icon={true} onClick={() => setExporting(true)}>
          <Printer/>
        </Button>

        <Link title="Edit article" className={buttonStyles.primary} to={`/article/${article._id}`}>
          <Edit3/>
        </Link>

        <Link title="Preview (open a new window)" target="_blank" className={buttonStyles.icon}
              to={`/article/${article._id}/preview`}>
          <Eye/>
        </Link>
      </aside>

      {deleting && (
        <div className={clsx(styles.alert, styles.deleteArticle)}>
          <p>
            You are trying to delete this article, double click on the
            &quot;delete button&quot; below to proceed
          </p>
          <Button className={styles.cancel} onClick={() => setDeleting(false)}>
            Cancel
          </Button>

          <ArticleDelete article={article} setNeedReload={setNeedReload}/>
        </div>
      )}

      <section className={styles.metadata}>
        <p className={styles.metadataAuthoring}>
          {tags.map((t) => (
            <span className={styles.tagChip} key={'tagColor-' + t._id} style={{ backgroundColor: t.color || 'grey' }}/>
          ))}
          by <span className={styles.author}>{article.owner.displayName}</span>
          {contributors.length > 0 && (<span className={styles.contributors}>
          , <span className={styles.author}>{contributors.map(c => c.user.displayName).join(', ')}</span>
          </span>)}

          <time dateTime={article.updatedAt} className={styles.momentsAgo}>
            ({formatTimeAgo(article.updatedAt)})
          </time>
        </p>

        {expanded && (
          <>
            <h4>Last versions</h4>
            <ul className={styles.versions}>
              {versions.map((v) => (
                <li key={`version-${v._id}`}>
                  <Link to={`/article/${article._id}/version/${v._id}`}>{`${
                    v.message ? v.message : 'no label'
                  } (v${v.version}.${v.revision})`}</Link>
                </li>
              ))}
            </ul>

            <h4>Tags</h4>
            <div className={styles.editTags}>
              <ArticleTags articleId={article._id} tags={tags} userTags={userTags} onChange={handleTagUpdate}/>
            </div>
          </>
        )}
      </section>
    </article>
  )
}
