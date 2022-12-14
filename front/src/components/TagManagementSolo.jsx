import React, { useState } from 'react'
import { useGraphQL } from '../helpers/graphQL'
import etv from '../helpers/eventTargetValue'

import { ChevronDown, ChevronRight, Edit3, Check, Trash } from 'react-feather'

import styles from './tagManagementSolo.module.scss'
import Button from './Button'
import Field from './Field'

export default function tagManagementSolo (props) {
  const [expanded, setExpanded] = useState(false)
  const [edit, setEdit] = useState(false)
  const [tempName, setTempName] = useState(props.t.name)
  const [tempDescription, setTempDescription] = useState(props.t.description)
  const [tempColor, setTempColor] = useState(props.t.color)
  const runQuery = useGraphQL()

  const deleteTag = async (id) => {
    const query = `mutation($user:ID!,$tag:ID!){deleteTag(user:$user,tag:$tag){ _id }}`
    const variables = { user: props.currentUser._id, tag: id }
    await runQuery({ query, variables })
    props.setNeedReload()
  }

  const saveTag = async () => {
    const query = `mutation($user:ID!,$tag:ID!,$color:String!,$name:String!,$description:String!){updateTag(user:$user,tag:$tag,name:$name,description:$description,color:$color){ _id name description color }}`
    const variables = {
      user: props.currentUser._id,
      tag: props.t._id,
      name: tempName,
      description: tempDescription,
      color: tempColor,
    }
    await runQuery({ query, variables })
    props.setNeedReload()
    setEdit(false)
  }

  const cancelEdit = () => {
    setTempColor(props.t.color)
    setTempName(props.t.name)
    setTempDescription(props.t.description)
    setEdit(false)
  }

  return (
    <div
      className={
        props.t.selected ? styles.selectedTags : styles.tags
      }
      key={`tagy-${props.t._id}`}
    >
      {!edit && (
        <article className={styles.reader}>
          <p tabIndex={0} onClick={() => setExpanded(!expanded)}>{expanded ? <ChevronDown/> : <ChevronRight/>} {props.t.name}</p>
          {expanded && <div className={styles.tagContent}>
            <p>{props.t.description}</p>
            <ul className={styles.action}>
              <li>
                <Button title="Delete" onClick={() => deleteTag(props.t._id)}>
                  <Trash />
                  Delete
                </Button>
              </li>
              <li>
                <Button primary={true} title="Edit" onClick={() => setEdit(true)}>
                  <Edit3 /> Edit
                </Button>
              </li>
            </ul>
          </div>}
        </article>
      )}
      {edit && (
        <article className={styles.writer}>
          <form className={styles.editTag}>
            <Field
              type="text"
              value={tempName}
              onChange={(e) => setTempName(etv(e))}
            />
            <textarea
              value={tempDescription}
              onChange={(e) => setTempDescription(etv(e))}
            />
            <Field
              type="color"
              value={tempColor}
              onChange={(e) => setTempColor(etv(e))}
            />
          </form>
          <ul className={styles.action}>
            <li>
              <Button title="Cancel" onClick={() => cancelEdit()}>
                Cancel
              </Button>
            </li>
            <li>
              <Button primary={true} title="Validate" onClick={() => saveTag()}>
                <Check />
                Save
              </Button>
            </li>
          </ul>
        </article>
      )}
    </div>
  )
}
