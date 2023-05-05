import React, { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { Modal as GeistModal } from '@geist-ui/core'

import styles from './articles.module.scss'
import buttonStyles from './button.module.scss'
import fieldStyles from './field.module.scss'

import Modal from './Modal'
import Export from './Export'
import ArticleDelete from './ArticleDelete'
import ArticleTags from './ArticleTags'

import etv from '../helpers/eventTargetValue'

import Field from './Field'
import Button from './Button'
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Edit3,
  Eye,
  Printer,
  Send,
  Trash,
  UserPlus
} from 'react-feather'

import { duplicateArticle } from './Acquintances.graphql'
import { renameArticle, getArticleVersions, getArticleWorkspaces } from './Article.graphql'
import { useGraphQL } from '../helpers/graphQL'
import TimeAgo from './TimeAgo.jsx'
import WorkspaceSelectItem from './workspace/WorkspaceSelectItem.jsx'
import { useSelector } from 'react-redux'
import ContributorItem from './ContributorItem.jsx'
import ArticleContributors from './ArticleContributors.jsx'
import ArticleSendCopy from './ArticleSendCopy.jsx'

export default function Article ({ article, setNeedReload, updateTitleHandler, updateTagsHandler, userTags }) {
  const activeUser = useSelector(state => state.activeUser)
  const [expanded, setExpanded] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [tags, setTags] = useState(article.tags)
  const [renaming, setRenaming] = useState(false)
  const [title, setTitle] = useState(article.title)
  const [versions, setVersions] = useState(article.versions || [])
  const [workspaces, setWorkspaces] = useState(article.workspaces || [])
  const [tempTitle, setTempTitle] = useState(article.title)
  const [sharing, setSharing] = useState(false)
  const [sending, setSending] = useState(false)
  const runQuery = useGraphQL()

  const isArticleOwner = activeUser._id === article.owner._id
  const contributors = article.contributors.filter(c => c.user._id !== article.owner._id)

  const handleTagUpdate = useCallback(tags => {
    setTags(tags)
    updateTagsHandler(article._id, tags)
  }, [])

  const handleWorkspaceUpdate = useCallback(workspaceIds => {
    setWorkspaces(workspaceIds.map(id => activeUser.workspaces.find(({ _id }) => _id === id)))
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

  useEffect(() => {
    (async () => {
      if (expanded) {
        try {
          const data = await runQuery({ query: getArticleWorkspaces, variables: { articleId: article._id } })
          setWorkspaces(data.article.workspaces)
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


  const closeSendingModal =  useCallback(() => {
    setSending(false)
  }, [])

  const closeSharingModal =  useCallback(() => {
    setSharing(false)
  }, [])

  return (
    <article className={styles.article}>
      {exporting && (
        <Modal title="Export" cancel={() => setExporting(false)}>
          <Export articleId={article._id} bib={article.workingVersion.bibPreview} name={article.title}/>
        </Modal>
      )}

      <GeistModal width='30rem' visible={sharing} onClose={closeSharingModal}>
        <h2>Partager l'article avec un contact</h2>
        <span className={styles.sendSubtitle}>
          <span className={styles.sendText}>Permet de partager un article avec l'un de vos contacts</span>
        </span>
        <GeistModal.Content>
          <ArticleContributors article={article} setNeedReload={setNeedReload} cancel={closeSharingModal}/>
        </GeistModal.Content>
        <GeistModal.Action passive onClick={closeSharingModal}>Fermer</GeistModal.Action>
      </GeistModal>

      <GeistModal width='25rem' visible={sending} onClose={closeSendingModal}>
        <h2>Envoyer une copie de l'article</h2>
        <span className={styles.sendSubtitle}>
          <span className={styles.sendText}>Permet d'envoyer une copie de l'article à l'un de vos contacts en cliquant sur l'icône{' '}</span>
          <span><Send className={styles.sendIcon}/></span>
        </span>
        <GeistModal.Content>
          <ArticleSendCopy article={article} setNeedReload={setNeedReload} cancel={closeSendingModal}/>
        </GeistModal.Content>
        <GeistModal.Action passive onClick={closeSendingModal}>Fermer</GeistModal.Action>
      </GeistModal>

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

        {<Button title="Send a copy" icon={true} onClick={() => setSending(true)}>
          <Send/>
        </Button>}

        {<Button title="Share article" icon={true} onClick={() => setSharing(true)}>
          <UserPlus/>
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
          <span className={styles.by}>by</span> <span className={styles.author}>{article.owner.displayName}</span>
          {contributors.length > 0 && (<span className={styles.contributorNames}><span>, {contributors.map(c => c.user.displayName || c.user.username).join(', ')}</span></span>)}
          <TimeAgo date={article.updatedAt} className={styles.momentsAgo}/>
        </p>

        {expanded && (
          <>
            <h4>Versions</h4>
            <ul className={styles.versions}>
              {versions.map((v) => (
                <li key={`version-${v._id}`}>
                  <Link to={`/article/${article._id}/version/${v._id}`}>{`${
                    v.message ? v.message : 'no label'
                  } (v${v.version}.${v.revision})`}</Link>
                </li>
              ))}
            </ul>

            <h4>Étiquettes</h4>
            <div className={styles.editTags}>
              <ArticleTags articleId={article._id} tags={tags} userTags={userTags} onChange={handleTagUpdate}/>
            </div>

            <h4>Espaces de travail</h4>
            <ul className={styles.workspaces}>
              {activeUser.workspaces.map((workspace) => <WorkspaceSelectItem
                key={workspace._id}
                id={workspace._id}
                color={workspace.color}
                name={workspace.name}
                articleId={article._id}
                workspaceIds={workspaces.map(({_id}) => _id)}
                onChange={handleWorkspaceUpdate}/>)}
            </ul>

            <h4>Contributeurs</h4>
            <div className={styles.contributorsAction}>
              {/*<Button small={true} >*/}
              {/*  <UserPlus /> Partager l'article*/}
              {/*</Button>*/}
            </div>
            <ul className={styles.contributors}>
              <ContributorItem name="Revue Fémur"></ContributorItem>
              <ContributorItem name="margotmothes" email="margotmths@gmail.com"></ContributorItem>
              <ContributorItem name="Antoine"></ContributorItem>
            </ul>
          </>
        )}
      </section>
    </article>
  )
}
