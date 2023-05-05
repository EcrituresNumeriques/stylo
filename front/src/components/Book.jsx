import React, { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronDown, ChevronRight, Edit3, MessageSquare, Printer } from 'react-feather'

import Modal from './Modal'
import Export from './Export'
import Chapter from './Chapter'

import etv from '../helpers/eventTargetValue'
import { useGraphQL } from '../helpers/graphQL'
import { updateTag as query } from './Books.graphql'

import styles from './articles.module.scss'
import buttonStyles from './button.module.scss'
import fieldStyles from './field.module.scss'

import Button from './Button'
import Field from './Field'
import { useCurrentUser } from '../contexts/CurrentUser'
import clsx from 'clsx'
import TimeAgo from './TimeAgo.jsx'

export default function Book ({ name: tagName, _id, updatedAt, articles }) {
  const activeUser = useCurrentUser()

  const [expanded, setExpanded] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [tempName, setTempName] = useState(tagName)
  const [name, setName] = useState(tagName)
  const [isRenaming, setIsRenaming] = useState(false)

  const runQuery = useGraphQL()

  const renameBook = useCallback(async (event) => {
    event.preventDefault()
    const variables = {
      user: activeUser._id,
      tag: _id,
      name: tempName,
    }
    const newTag = await runQuery({ query, variables })
    setName(newTag.updateTag.name)
    setIsRenaming(false)
  }, [tempName])

  return (
    <article className={styles.article}>
      {exporting && (
        <Modal title="Export" cancel={() => setExporting(false)}>
          <Export bookId={_id} name={name} bib={articles.at(0)?.versions.at(0).bibPreview} />
        </Modal>
      )}

      {!isRenaming && (
        <h1 className={styles.title} onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronDown/> : <ChevronRight/>}
          {name} <TimeAgo date={updatedAt} />

          <Button className={clsx(buttonStyles.icon, styles.editTitleButton)} onClick={(evt) => evt.stopPropagation() || setIsRenaming(true)}>
            <Edit3 />
          </Button>
        </h1>
      )}
      {isRenaming && (<form className={clsx(styles.renamingForm, fieldStyles.inlineFields)} onSubmit={renameBook}>
        <Field autoFocus={true} type="text" value={tempName} onChange={(e) => setTempName(etv(e))} placeholder="Article Title" />
        <Button title="Save" primary={true} onClick={renameBook}>
          <Check /> Save
        </Button>
        <Button title="Cancel" type="button" onClick={() => {
          setIsRenaming(false)
          setTempName(name)
        }}>
          Cancel
        </Button>
      </form>)}

      <aside className={styles.actionButtons}>
        <Link
          className={[buttonStyles.icon, buttonStyles.button, articles.length === 0 ? buttonStyles.isDisabled : ''].filter(d => d).join(' ')}
          title="Preview"
          target="_blank"
          to={`/books/${_id}/preview`}
        >
          <MessageSquare />
        </Link>
        <Button className={buttonStyles.icon} title="Export" onClick={() => setExporting(true)}>
          <Printer />
        </Button>
      </aside>

      <section className={styles.metadata}>
        {expanded && (
          <>
            <h4>Chapters</h4>
            <ul className={styles.versions}>
              {articles.map((article) => {
                return <li key={`chapter-${_id}-${article._id}`}>
                  <Chapter article={article} />
                </li>
              })}
            </ul>
          </>
        )}
      </section>
    </article>
  )
}
