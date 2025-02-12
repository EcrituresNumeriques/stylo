import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Check,
  ChevronDown,
  ChevronRight,
  Edit3,
  MessageSquare,
  Printer,
} from 'react-feather'

import Modal from './Modal.jsx'
import Export from './Export.jsx'
import Chapter from './Chapter.jsx'

import etv from '../helpers/eventTargetValue.js'
import { useGraphQL } from '../helpers/graphQL.js'
import { updateTag as query } from './Corpus.graphql'

import styles from './articles.module.scss'
import buttonStyles from './button.module.scss'
import fieldStyles from './field.module.scss'

import Button from './Button.jsx'
import Field from './Field.jsx'
import { useCurrentUser } from '../contexts/CurrentUser.js'
import clsx from 'clsx'
import TimeAgo from './TimeAgo.jsx'

export default function Book({ name: tagName, _id, updatedAt, articles }) {
  const activeUser = useCurrentUser()

  const [expanded, setExpanded] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [tempName, setTempName] = useState(tagName)
  const [name, setName] = useState(tagName)
  const [isRenaming, setIsRenaming] = useState(false)
  const { t } = useTranslation()

  const runQuery = useGraphQL()

  const renameBook = useCallback(
    async (event) => {
      event.preventDefault()
      const variables = {
        user: activeUser._id,
        tag: _id,
        name: tempName,
      }
      const newTag = await runQuery({ query, variables })
      setName(newTag.updateTag.name)
      setIsRenaming(false)
    },
    [tempName]
  )

  return (
    <article className={styles.article}>
      {exporting && (
        <Modal title="Export" cancel={() => setExporting(false)}>
          <Export
            bookId={_id}
            name={name}
            bib={articles.at(0)?.versions.at(0).bibPreview}
          />
        </Modal>
      )}

      {!isRenaming && (
        <h1 className={styles.title} onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronDown /> : <ChevronRight />}
          {name} <TimeAgo date={updatedAt} />
          <Button
            className={clsx(buttonStyles.icon, styles.editTitleButton)}
            onClick={(evt) => evt.stopPropagation() || setIsRenaming(true)}
          >
            <Edit3 />
          </Button>
        </h1>
      )}
      {isRenaming && (
        <form
          className={clsx(styles.renamingForm, fieldStyles.inlineFields)}
          onSubmit={renameBook}
        >
          <Field
            autoFocus={true}
            type="text"
            value={tempName}
            onChange={(e) => setTempName(etv(e))}
            placeholder="Article Title"
          />
          <Button title="Save" primary={true} onClick={renameBook}>
            <Check /> Save
          </Button>
          <Button
            title="Cancel"
            type="button"
            onClick={() => {
              setIsRenaming(false)
              setTempName(name)
            }}
          >
            Cancel
          </Button>
        </form>
      )}

      <aside className={styles.actionButtons}>
        <Link
          className={[
            buttonStyles.icon,
            buttonStyles.button,
            articles.length === 0 ? buttonStyles.isDisabled : '',
          ]
            .filter((d) => d)
            .join(' ')}
          title={t('corpus.preview.buttonTitle')}
          target="_blank"
          to={`/corpus/${_id}/preview`}
        >
          <MessageSquare />
        </Link>
        <Button
          className={buttonStyles.icon}
          title={t('corpus.export.button')}
          onClick={() => setExporting(true)}
        >
          <Printer />
        </Button>
      </aside>

      <section className={styles.metadata}>
        {expanded && (
          <>
            <h4>Chapters</h4>
            <ul className={styles.versions}>
              {articles.map((article) => {
                return (
                  <li key={`chapter-${_id}-${article._id}`}>
                    <Chapter article={article} />
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </section>
    </article>
  )
}
