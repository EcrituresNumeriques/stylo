import React, { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

import styles from './articles.module.scss'
import buttonStyles from './button.module.scss'

import Modal from './Modal'
import Export from './Export'
import ArticleDelete from './ArticleDelete'
import Acquintances from './Acquintances'
import ArticleTags from './ArticleTags'

import formatTimeAgo from '../helpers/formatTimeAgo'
import etv from '../helpers/eventTargetValue'

import Field from './Field'
import Button from './Button'
import { Check, ChevronDown, ChevronRight, Copy, Edit3, Eye, MessageSquare, Printer, Share2, Trash } from 'react-feather'

import { duplicateArticle } from './Acquintances.graphql'
import { renameArticle } from './Article.graphql'
import { useGraphQL } from '../helpers/graphQL'

export default function Article ({ article, currentUser:activeUser, setNeedReload, updateTitleHandler, updateTagsHandler, masterTags }) {
  const [expanded, setExpanded] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [tags, setTags] = useState(article.tags)
  const [renaming, setRenaming] = useState(false)
  const [title, setTitle] = useState(article.title)
  const [tempTitle, setTempTitle] = useState(article.title)
  const [sharing, setSharing] = useState(false)
  const runQuery = useGraphQL()

  const isArticleOwner = activeUser._id === article.owner._id

  const contributors = article.contributors.filter(c => c.user._id !== article.owner._id)

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
  }, [article.title])

  return (
    <article className={styles.article}>
      {exporting && (
        <Modal cancel={() => setExporting(false)}>
          <Export articleVersionId={article._id} articleId={article._id} />
        </Modal>
      )}

      {sharing && (
        <Modal cancel={() => setNeedReload() || setSharing(false)}>
          <Acquintances article={article} setNeedReload={setNeedReload} cancel={() => setSharing(false)} />
        </Modal>
      )}

      {!renaming && (
        <h1 className={styles.title} onClick={toggleExpansion}>
          <span tabIndex={0} onKeyUp={toggleExpansion}>
            {expanded ? <ChevronDown/> : <ChevronRight/>}
          </span>
          {title}

          <Button title="Edit" icon={true} className={styles.editTitleButton} onClick={(evt) => evt.stopPropagation() || setRenaming(true)}>
            <Edit3 size="20" />
          </Button>
        </h1>
      )}
      {renaming && (
        <form className={styles.renamingForm} onSubmit={(e) => rename(e)}>
          <Field autoFocus={true} type="text" value={tempTitle} onChange={(e) => setTempTitle(etv(e))} placeholder="Article Title" />
          <Button title="Save" primary={true} onClick={(e) => rename(e)}>
            <Check /> Save
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
        {isArticleOwner && <Button title={contributors.length ? 'Remove all contributors in order to delete this article' : 'Delete'} disabled={contributors.length > 0} icon={true} onClick={() => setDeleting(true)}>
          <Trash />
        </Button>}

        <Button title="Duplicate" icon={true} onClick={() => fork()}>
          <Copy />
        </Button>

        <Link title="Annotate with Stylo users and other people (open a new window)" target="_blank" className={clsx(buttonStyles.button, buttonStyles.icon)} to={`/article/${article._id}/annotate`}>
          <MessageSquare />
        </Link>

        {<Button title="Share with Stylo users" icon={true} onClick={() => setSharing(true)}>
          <Share2 />
        </Button>}

        <Button title="Download a printable version" icon={true} onClick={() => setExporting(true)}>
          <Printer />
        </Button>

        <Link title="Edit article" className={clsx(buttonStyles.button, buttonStyles.primary)} to={`/article/${article._id}`}>
          <Edit3 />
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

          <ArticleDelete article={article} setNeedReload={setNeedReload} />
        </div>
      )}

      <section className={styles.metadata}>
        <p className={styles.metadataAuthoring}>
          {tags.map((t) => (
            <span className={styles.tagChip} key={'tagColor-' + t._id} style={{ backgroundColor: t.color || 'grey' }} />
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
            {article.versions.map((v) => (
              <li key={`version-${v._id}`}>
                <Link to={`/article/${article._id}/version/${v._id}`}>{`${
                  v.message ? v.message : 'no label'
                } (v${v.version}.${v.revision})`}</Link>
              </li>
            ))}
          </ul>

          <h4>Tags</h4>
          <div className={styles.editTags}>
            <ArticleTags
              currentUser={activeUser}
              article={article}
              masterTags={masterTags}
              stateTags={tags.map((t) => {
                t.selected = true
                return t
              })}
              setTags={(tags) => {
                setTags(tags)
                if (updateTagsHandler) {
                  updateTagsHandler(article._id, tags)
                }
              }}
            />
          </div>
        </>
      )}
      </section>
    </article>
  )
}
