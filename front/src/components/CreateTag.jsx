import React, { useState } from 'react'
import PropTypes from 'prop-types'

import etv from '../helpers/eventTargetValue'
import { useGraphQL } from '../helpers/graphQL'
import { createTag as query } from './Tag.graphql'

import styles from './createTag.module.scss'
import Field from './Field'
import Button from './Button'
import { Check } from 'react-feather'

export default function CreateTag ({ currentUserId, cancel, triggerReload }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tempColor, setTempColor] = useState('#ccc')

  const runQuery = useGraphQL()

  const variables = {
    user: currentUserId,
    name,
    description,
    color: tempColor,
  }

  const createTag = async (event, query, variables) => {
    try {
      event.preventDefault()
      await runQuery({ query, variables })
      triggerReload()
    } catch (err) {
      alert(err)
    }
  }

  return (
    <section className={styles.create}>
      <form
        onSubmit={(event) => {
          createTag(
            event,
            query,
            variables,
          )
        }}
      >
        <Field
          type="text"
          placeholder="Tag Name"
          autoFocus={true}
          className={styles.tagName}
          value={name}
          onChange={(e) => setName(etv(e))}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(etv(e))}
        />

        <Field
              type="color"
              value={tempColor}
              onChange={(e) => setTempColor(etv(e))}
            />

        <ul className={styles.actions}>
          <li>
            <Button type="button" onClick={cancel}>Cancel</Button>
          </li>
          <li>
            <Button primary={true} type="submit" title="Create Article">
              <Check />
              Create Tag
            </Button>
          </li>
        </ul>
      </form>
    </section>
  )
}

CreateTag.propTypes = {
  cancel: PropTypes.func.isRequired,
  currentUserId: PropTypes.string.isRequired,
  triggerReload: PropTypes.func.isRequired
}
