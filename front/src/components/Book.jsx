import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronDown, ChevronRight, Edit3, Eye, Printer } from 'react-feather'
import { useSelector } from 'react-redux'

import Modal from './Modal'
import Export from './Export'
import Chapter from './Chapter'

import etv from '../helpers/eventTargetValue'
import { useGraphQL } from '../helpers/graphQL'
import formatTimeAgo from '../helpers/formatTimeAgo'
import { generateBookExportId } from "../helpers/identifier"

import styles from './articles.module.scss'
import buttonStyles from './button.module.scss'

import Button from './Button'
import Field from './Field'

const alphaSort = (a, b) => a.title.localeCompare(b.title)

export default function Book ({ name: tagName, _id, updatedAt, articles }) {
  const userId = useSelector(state => state.activeUser._id)

  const [expanded, setExpanded] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [tempName, setTempName] = useState(tagName)
  const [name, setName] = useState(tagName)
  const [isRenaming, setIsRenaming] = useState(false)

  const runQuery = useGraphQL()

  const renameBook = async (event) => {
    event.preventDefault()
    const query = `mutation($user:ID!,$tag:ID!,$name:String,$description:String){ updateTag(user:$user,tag:$tag,name:$name,description:$description){ _id name description } }`
    const variables = {
      user: userId,
      tag: _id,
      name: tempName,
    }
    const newTag = await runQuery({ query, variables })
    setName(newTag.updateTag.name)
    setIsRenaming(false)
  }

  const bookTitle = `${name} (${formatTimeAgo(updatedAt)})`
  return (
    <article className={styles.article}>
      {exporting && (
        <Modal cancel={() => setExporting(false)}>
          <Export
            exportId={generateBookExportId(name)}
            bookId={_id}
          />
        </Modal>
      )}

      {!isRenaming && (
        <h1 className={styles.title} onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronDown/> : <ChevronRight/>}
          {bookTitle}

          <Button className={[buttonStyles.icon, styles.editTitleButton].join(' ')} onClick={(evt) => evt.stopPropagation() || setIsRenaming(true)}>
            <Edit3 />
          </Button>
        </h1>
      )}
      {isRenaming && (<form className={styles.renamingForm} onSubmit={(e) => renameBook(e)}>
        <Field autoFocus={true} type="text" value={tempName} onChange={(e) => setTempName(etv(e))} placeholder="Article Title" />
        <Button title="Save" primary={true} onClick={(e) => renameBook(e)}>
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
          <Eye />
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
              {articles.sort(alphaSort).map((article) => {
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
