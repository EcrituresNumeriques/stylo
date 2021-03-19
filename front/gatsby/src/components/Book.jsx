import React, { useState } from 'react'
import etv from '../helpers/eventTargetValue'

import askGraphQL from '../helpers/graphQL'

import Modal from './Modal'
import Export from './Export'
import Chapter from './Chapter'
import formatTimeAgo from '../helpers/formatTimeAgo'

import styles from './book.module.scss'
import { Edit3, Eye, Printer } from 'react-feather'
import { Check, ChevronDown, ChevronRight } from 'react-feather'
import { connect } from 'react-redux'
import Button from './Button'
import buttonStyles from './button.module.scss'
import Field from './Field'

const alphaSort = (a, b) => {
  if (a.title < b.title) {
    return -1
  }
  if (a.title > b.title) {
    return 1
  }
  return 0
}

const mapStateToProps = ({ sessionToken, activeUser, applicationConfig }) => {
  return { sessionToken, activeUser, applicationConfig }
}

const Book = (props) => {
  const exportEndpoint = props.applicationConfig.exportEndpoint
  const [expanded, setExpanded] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [tempName, setTempName] = useState(props.name)
  const [name, setName] = useState(props.name)
  const [isRenaming, setIsRenaming] = useState(false)

  const renameBook = async () => {
    const query = `mutation($user:ID!,$tag:ID!,$name:String,$description:String){ updateTag(user:$user,tag:$tag,name:$name,description:$description){ _id name description } }`
    const variables = {
      user: props.activeUser._id,
      tag: props._id,
      name: tempName,
    }
    const newTag = await askGraphQL(
      { query, variables },
      'Updating infos of the tag',
      props.sessionToken,
      props.applicationConfig
    )
    setName(newTag.updateTag.name)
    setIsRenaming(false)
  }

  const bookTitle = `${name} (${formatTimeAgo(new Date(props.updatedAt))})`
  return (
    <article>
      {exporting && (
        <Modal cancel={() => setExporting(false)}>
          <Export {...props} book={true} bookId={props._id} />
        </Modal>
      )}
      <header>
        {!isRenaming && (
          <h1 className={styles.bookTitle}>
            <span onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronDown /> : <ChevronRight />} {bookTitle}
            </span>
            <Button className={[buttonStyles.icon, styles.editTitleButton].join(' ')} onClick={() => setIsRenaming(true)}>
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
            setTempName(props.name)
          }}>
            Cancel
          </Button>
        </form>)}
        <ul className={styles.actions}>
          <li>
            <a
              className={[buttonStyles.icon, buttonStyles.button].join(' ')}
              title="Preview"
              target="_blank"
              href={`https://via.hypothes.is/${exportEndpoint}/htmlBook/${props._id}?preview=true`}
            >
              <Eye />
            </a>
          </li>
          <li>
            <Button className={buttonStyles.icon} title="Export" onClick={() => setExporting(true)}>
              <Printer />
            </Button>
          </li>
        </ul>
      </header>
      {expanded && (
        <section>
          <h4>Chapters</h4>
          <ul>
            {props.articles.sort(alphaSort).map((a) => (
              <Chapter
                key={`chapter-${props._id}-${a._id}`}
                {...a}
                setNeedReload={props.setNeedReload}
              />
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}

export default connect(mapStateToProps)(Book)
