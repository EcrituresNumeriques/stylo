import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

import styles from './Articles.module.scss'

import Modal from './Modal'
import Export from './Export'
import ArticleDelete from './ArticleDelete'
import Acquintances from './Acquintances'
import ArticleTags from './ArticleTags'
import howLongAgo from '../helpers/howLongAgo'

import etv from '../helpers/eventTargetValue'
import askGraphQL from '../helpers/graphQL'

import Bouton from './Bouton'
import * as Icon from 'react-feather'

const mapStateToProps = ({ activeUser, sessionToken, applicationConfig }) => {
  return { activeUser, sessionToken, applicationConfig }
}

const ConnectedArticle = (props) => {
  const exportEndpoint = props.applicationConfig.exportEndpoint
  const [expanded, setExpanded] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editTags, setEditTags] = useState(false)
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
    <article>
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
      <nav>
        <Bouton
          title="Preview"
          href={`https://via.hypothes.is/${exportEndpoint}/api/v1/htmlArticle/${props._id}?preview=true`}
        >
          <Icon.Eye />
        </Bouton>
        <Bouton title="Share" onClick={() => setSharing(true)}>
          <Icon.Send />
        </Bouton>
        <Bouton title="Duplicate" onClick={() => fork()}>
          <Icon.Copy />
        </Bouton>
        <Bouton title="Export" onClick={() => setExporting(true)}>
          <Icon.Printer />
        </Bouton>
        <Bouton title="Edit" primary={true} href={`/article/${props._id}`}>
          <Icon.Edit3 />
        </Bouton>
      </nav>
      {!renaming && (
        <h1>
          <span onClick={() => setExpanded(!expanded)}>
            {expanded ? '-' : '+'}
          </span>
          <span onClick={() => setExpanded(!expanded)}> {title} </span>
          <Bouton title="Edit" thin={true} onClick={() => setRenaming(true)}>
            <Icon.Edit3 />
          </Bouton>
        </h1>
      )}
      {renaming && (
        <form onSubmit={(e) => rename(e)}>
          <input value={tempTitle} onChange={(e) => setTempTitle(etv(e))} />
          <Bouton title="Save" onClick={(e) => rename(e)}>
            <Icon.Save />
          </Bouton>
          <Bouton title="Cancel" onClick={() => setRenaming(false)}>
            <Icon.X />
          </Bouton>
        </form>
      )}
      <p style={{ paddingLeft: '1rem' }}>
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
        by <span>{props.owners.map((o) => o.displayName).join(', ')}</span>
        <span style={{ fontSize: '0.7rem' }}>
          ({howLongAgo(new Date() - new Date(props.updatedAt))})
        </span>
      </p>
      {expanded && (
        <section>
          <ul>
            <p>Last versions:</p>
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
          {!deleting && (
            <p className={styles.deleteMe}>
              <Bouton title="Delete" onClick={() => setDeleting(true)}>
                <Icon.Trash />
              </Bouton>
            </p>
          )}
          <ul>
            <p>
              Tags (
              <span
                onClick={() => {
                  if (editTags) {
                    props.setNeedReload()
                  }
                  setEditTags(!editTags)
                }}
              >
                {editTags ? 'finish' : 'edit'}
              </span>
              ):
            </p>
            <ArticleTags
              editTags={editTags}
              {...props}
              stateTags={tags}
              setTags={(ts) => setTags(ts)}
            />
          </ul>
          {deleting && (
            <div className={styles.alert}>
              <p>
                You are trying to delete this article, double click on the
                "delete button" below to proceed
              </p>
              <button
                className={styles.cancel}
                onClick={() => setDeleting(false)}
              >
                Cancel
              </button>
              <ArticleDelete {...props} />
            </div>
          )}
        </section>
      )}
    </article>
  )
}

const Article = connect(mapStateToProps)(ConnectedArticle)

export default Article
