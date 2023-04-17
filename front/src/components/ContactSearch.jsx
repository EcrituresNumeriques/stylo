import { PlusSquare, Search } from 'react-feather'
import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import styles from './ContactSearch.module.scss'
import Field from './Field.jsx'

import { useGraphQL } from '../helpers/graphQL.js'
import { getAcquintances as getContacts, getUserByEmail } from './Acquintances.graphql'
import Button from './Button.jsx'
import debounce from 'lodash.debounce'

export default function ContactSearch () {
  const runQuery = useGraphQL()
  const activeUserId = useSelector(state => state.activeUser._id)
  const [filter, setFilter] = useState('')
  const [contacts, setContacts] = useState([])
  const [userFound, setUserFound] = useState(null)
  const filterByEmail = useCallback((contact) => {
    return contact._id !== activeUserId && contact.email.toLowerCase().includes(filter.toLowerCase())
  }, [filter])
  const contactsFound = contacts.filter(filterByEmail)

  const searchContact = debounce(
    async ({ email }) => {
      console.log("search by email: ", email)
      const data = await runQuery({ query: getUserByEmail, variables: { userEmail: email } })
      setUserFound(data.getUser)
    },
    500,
    { leading: false, trailing: true }
  )

  useEffect(() => {
    (async () => {
      const data = await runQuery({ query: getContacts, variables: { user: activeUserId } })
      const contacts = data.user.acquintances
      setContacts(contacts)
    })()
  }, [activeUserId])

  useEffect(() => {
    if (contactsFound.length === 0 && filter !== '') {
      searchContact({ email: filter })
    }
  }, [filter])

  const updateFilter = useCallback((event) => {
    const email = event.target.value
    setFilter(email)
  }, [])

  return (
    <>
      <div className={styles.header}>
        <h3>Liste des contacts</h3>
        <Field className={styles.searchField}
               type="text"
               icon={Search}
               value={filter}
               placeholder="Email du contact"
               onChange={updateFilter}
        />
      </div>
      {userFound && <Button><PlusSquare/> Ajouter un nouveau contact</Button>}
      <div className={styles.contacts}>
        {contactsFound.map((user) => (
          <div key={`contact-${user._id}`} className={styles.contact}>
            <div>
              <span>{user.displayName || user.username}</span>
              {user.email && <a href={'mailto:' + user.email} className={styles.contactEmail}>{user.email}</a>}
              {/* afficher un symbole si le contact a déjà accès à l'article ! */}
            </div>
          </div>
        ))}
        {contactsFound.length === 0 && !userFound &&
          <>
            Aucun contact trouvé pour cette adresse email.<br/>

          </>}
      </div>
    </>
  )
}
