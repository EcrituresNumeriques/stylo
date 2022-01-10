import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

import styles from './Articles.module.scss'
import buttonStyles from './button.module.scss'

import Modal from './Modal'
import Export from './Export'
import ArticleDelete from './ArticleDelete'
import Acquintances from './Acquintances'
import ArticleTags from './ArticleTags'

import formatTimeAgo from '../helpers/formatTimeAgo'
import { generateArticleExportId } from "../helpers/identifier"
import etv from '../helpers/eventTargetValue'
import askGraphQL from '../helpers/graphQL'

import Field from './Field'
import Button from './Button'
import { Check, ChevronDown, ChevronRight, Copy, Edit3, Eye, Printer, Send, Trash } from 'react-feather'


const mapStateToProps = ({ activeUser, sessionToken, applicationConfig }) => {
  return { activeUser, sessionToken, applicationConfig }
}

const ConnectedArticle = (props) => {
  const [expanded, setExpanded] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [tags, setTags] = useState(props.tags)
  const [renaming, setRenaming] = useState(false)
  const [title, setTitle] = useState(props.title)
  const [tempTitle, setTempTitle] = useState(props.title)
  const [sharing, setSharing] = useState(false)

  const fork = async () => {
    try {
      const query = `mutation($user:ID!,$article:ID!){sendArticle(article:$article,to:$user,user:$user){ _id }}`
      const variables = {
        user: props.activeUser._id,
        to: props.activeUser._id,
        article: props._id,
      }
      await askGraphQL(
        { query, variables },
        'forking Article',
        props.sessionToken,
        props.applicationConfig
      )
      props.setNeedReload()
    } catch (err) {
      alert(err)
    }
  }

  const rename = async (e) => {
    e.preventDefault()
    const query = `mutation($article:ID!,$title:String!,$user:ID!){renameArticle(article:$article,title:$title,user:$user){title}}`
    const variables = {
      user: props.activeUser._id,
      article: props._id,
      title: tempTitle,
    }
    await askGraphQL(
      { query, variables },
      'Renaming Article',
      props.sessionToken,
      props.applicationConfig
    )
    setTitle(tempTitle)
    setRenaming(false)
    if (props.updateTitleHandler) {
      props.updateTitleHandler(props._id, tempTitle)
    }
  }

  return (
    <article className={styles.article}>
      {exporting && (
        <Modal cancel={() => setExporting(false)}>
          <Export
            exportId={generateArticleExportId(props.title)}
            articleVersionId={props._id}
          />
        </Modal>
      )}
      {sharing && (
        <Modal cancel={() => setSharing(false)} withCloseButton={false}>
          <Acquintances {...props} cancel={() => setSharing(false)} />
        </Modal>
      )}

      {!renaming && (
        <h1 className={styles.title} onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronDown/> : <ChevronRight/>}
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
            setTempTitle(props.title)
          }}>
            Cancel
          </Button>
        </form>
      )}

      <aside className={styles.actionButtons}>
        <Button title="Delete" icon={true} onClick={() => setDeleting(true)}>
          <Trash />
        </Button>

        <Link title="Preview" target="_blank" className={[buttonStyles.button, buttonStyles.icon].join(' ')} to={`/article/${props._id}/preview`}>
          <Eye />
        </Link>
        <Button title="Share" icon={true} onClick={() => setSharing(true)}>
          <Send />
        </Button>
        <Button title="Duplicate" icon={true} onClick={() => fork()}>
          <Copy />
        </Button>
        <Button title="Export" icon={true} onClick={() => setExporting(true)}>
          <Printer />
        </Button>
        <Link title="Edit" className={[buttonStyles.button, buttonStyles.primary].join(' ')} to={`/article/${props._id}`}>
          <Edit3 />
        </Link>
      </aside>

      {deleting && (
        <div className={[styles.alert, styles.deleteArticle].join(' ')}>
          <p>
            You are trying to delete this article, double click on the
            "delete button" below to proceed
          </p>
          <Button className={styles.cancel} onClick={() => setDeleting(false)}>
            Cancel
          </Button>

          <ArticleDelete {...props} />
        </div>
      )}

      <section className={styles.metadata}>
        <p>
          {tags.map((t) => (
            <span className={styles.tagChip} key={'tagColor-' + t._id} style={{ backgroundColor: t.color || 'grey' }} />
          ))}
          by <span className={styles.author}>{props.owners.map((o) => o.displayName).join(', ')}</span>

          <time dateTime={props.updatedAt} className={styles.momentsAgo}>
            ({formatTimeAgo(new Date(props.updatedAt))})
          </time>
        </p>

        {expanded && (
        <>
          <h4>Last versions</h4>
          <ul className={styles.versions}>
            {props.versions.map((v) => (
              <li key={`version-${v._id}`}>
                <Link to={`/article/${props._id}/version/${v._id}`}>{`${
                  v.message ? v.message : 'no label'
                } (v${v.version}.${v.revision})`}</Link>
              </li>
            ))}
          </ul>

          <h4>Tags</h4>
          <div className={styles.editTags}>
            <ArticleTags
              {...props}
              stateTags={tags.map((t) => {
                t.selected = true
                return t
              })}
              setTags={(tags) => {
                setTags(tags)
                if (props.updateTagsHandler) {
                  props.updateTagsHandler(props._id, tags)
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

const Article = connect(mapStateToProps)(ConnectedArticle)
export default Article
