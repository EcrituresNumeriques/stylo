import React, { useEffect, createRef, useState, forwardRef, useCallback } from 'react'

import { randomColor } from '../helpers/colors.js'
import etv from '../helpers/eventTargetValue'
import { useGraphQL } from '../helpers/graphQL'
import { createTag as query } from './Tag.graphql'

import styles from './createTag.module.scss'
import Field from './Field'
import Button from './Button'
import { useCurrentUser } from '../contexts/CurrentUser'
import { useDispatch } from 'react-redux'


const CreateTag = forwardRef((_, forwardedRef) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(randomColor())
  const activeUser = useCurrentUser()
  const runQuery = useGraphQL()
  const dispatch = useDispatch()

  const variables = {
    user: activeUser._id,
    name,
    description,
    color,
  }

  const handleCreateTag = useCallback((event) => {
    event.preventDefault()
    ;(async () => {
      try {
        const { createTag } = await runQuery({
          query,
          variables
        })
        dispatch({ type: 'TAG_CREATED', tag: createTag })
      } catch (err) {
        alert(err)
      }
    })()
  }, [variables])

  return (
    <section className={styles.create}>
      <form onSubmit={handleCreateTag}>
        <Field
          label="Name"
          type="text"
          autoFocus={true}
          value={name}
          onChange={(e) => setName(etv(e))}
          ref={forwardedRef}
        />
        <Field
          label="Description"
          type="text"
          value={description}
          onChange={(e) => setDescription(etv(e))}
        />
        <Field
          label="Color"
          type="color"
          value={color}
          onChange={(e) => setColor(etv(e))}
        />
        <ul className={styles.actions}>
          <li>
            <Button primary={true} type="submit" title="Create a new tag">
              Create a new tag
            </Button>
          </li>
        </ul>
      </form>
    </section>
  )
})

CreateTag.displayName = 'CreateTag'
export default CreateTag
