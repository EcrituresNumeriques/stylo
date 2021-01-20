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
import howLongAgo from '../helpers/howLongAgo'

import etv from '../helpers/eventTargetValue'
import askGraphQL from '../helpers/graphQL'

import Field from './Field'
import Button from './Button'
import {Eye, Send, Check, Copy, Printer, Edit3, Trash, Save, X, ChevronDown, ChevronRight} from 'react-feather'

const mapStateToProps = ({ activeUser, sessionToken, applicationConfig }) => {
  return { activeUser, sessionToken, applicationConfig }
}

const ConnectedArticle = (props) => {
  const exportEndpoint = props.applicationConfig.exportEndpoint
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
  }

  return (
    <article class={styles.article}>
      {exporting && (
        <Modal cancel={() => setExporting(false)}>
          <Export
            {...props}
            article={true}
            versionId={props.versions[0]._id}
            version={props.versions[0].version}
            revision={props.versions[0].revision}
          />
        </Modal>
      )}
      {sharing && (
        <Modal cancel={() => setSharing(false)}>
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
          <Field autofocus={true} type="text" value={tempTitle} onChange={(e) => setTempTitle(etv(e))} placeholder="Article Title" />

          <Button title="Save" primary={true} onClick={(e) => rename(e)}>
            <Check /> Save
          </Button>
          <Button title="Cancel" onClick={() => setRenaming(false)}>
            Cancel
          </Button>
        </form>
      )}

      <aside className={styles.actionButtons}>
        <Button title="Delete" icon={true} onClick={() => setDeleting(true)}>
          <Trash />
        </Button>

        <a
          title="Preview"
          className={[buttonStyles.button, buttonStyles.icon].join(' ')}
          href={`https://via.hypothes.is/${exportEndpoint}/api/v1/htmlArticle/${props._id}?preview=true`}
        >
          <Eye />
        </a>
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
            <span
              key={'tagColor-' + t._id}
              style={{
                fontSize: '0.6rem',
                backgroundColor: t.color || 'grey',
                display: 'inline-block',
                padding: '0.25rem',
                marginRight: '0.5rem',
                borderRadius: '100% 100%',
              }}
            ></span>
          ))}
          by <span className={styles.author}>{props.owners.map((o) => o.displayName).join(', ')}</span>

          <span className={styles.momentsAgo}>
            ({howLongAgo(new Date() - new Date(props.updatedAt))})
          </span>
        </p>

        {expanded && (
        <>
          <p>Last versions:</p>
          <ul>
            {props.versions.map((v) => (
              <li key={`version-${v._id}`}>
                <Link to={`/article/${props._id}/version/${v._id}`}>{`${
                  v.message ? v.message : 'no label'
                } (${v.autosave ? 'autosaved' : ''} v${v.version}.${
                  v.revision
                })`}</Link>
              </li>
            ))}
          </ul>

          <div className={styles.editTags}>
            <ArticleTags
              {...props}
              stateTags={tags}
              setTags={(ts) => setTags(ts)}
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
