import React, { useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import formStyles from './field.module.scss'
import { useGraphQL } from '../helpers/graphQL.js'

import Button from './Button'
import Field from './Field'

import { addAcquintance } from './Acquintances.graphql'

export default function ConnectedAcquintances ({ onAdd, autoFocus = true }) {
  const [contact, setContact] = useState('')
  const userId = useSelector(state => state.activeUser._id)
  const runQuery = useGraphQL()

  const addContact = useCallback(async (event) => {
    event.preventDefault()

    const { addAcquintance: user } = await runQuery({
      query: addAcquintance,
      variables: { email: contact, user: userId }
    })
    setContact('')
    onAdd(user.acquintances)
  }, [contact])

  return (<form onSubmit={addContact} className={formStyles.inlineFields}>
    <Field
      autoFocus={autoFocus}
      required={true}
      type="email"
      className={formStyles.fullWidth}
      placeholder='Email of the contact you want to add'
      value={contact}
      onChange={(e) => setContact(e.target.value)}
    />

    <Button type="submit">Add</Button>
  </form>)
}
