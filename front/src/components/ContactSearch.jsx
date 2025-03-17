import PropTypes from 'prop-types'
import { CheckSquare, Search, Square } from 'react-feather'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import debounce from 'lodash.debounce'
import { useTranslation } from 'react-i18next'

import styles from './ContactSearch.module.scss'
import Field from './Field.jsx'

import { getUserByEmail } from './Contacts.graphql'
import ContactItem from './ContactItem.jsx'
import { useContactActions } from '../hooks/contact.js'

/**
 * @param members
 * @param onUserUpdated
 * @param selectedIcon
 * @param unselectedIcon
 * @param showActiveUser
 * @returns {JSX.Element}
 * @constructor
 */
export default function ContactSearch({
  members,
  onUserUpdated,
  selectedIcon = <CheckSquare />,
  unselectedIcon = <Square />,
  showActiveUser,
}) {
  const { t } = useTranslation()
  const activeUser = useSelector((state) => state.activeUser)
  const activeUserId = activeUser._id
  const { contacts: userContacts, add, remove } = useContactActions()
  const [filter, setFilter] = useState('')
  const [contacts, setContacts] = useState([])
  const [userFound, setUserFound] = useState(null)
  const filterContact = useCallback(
    (contact) => {
      const contactName = contact.displayName || contact.username
      return (
        contact._id !== activeUserId &&
        (contact.email.toLowerCase().includes(filter.toLowerCase()) ||
          contactName.toLowerCase().includes(filter.toLowerCase()))
      )
    },
    [filter]
  )
  const contactsFound = useMemo(
    () => contacts.filter(filterContact),
    [contacts, filterContact]
  )
  const handleContactUpdate = useCallback(
    async (event) => {
      const { _id: userId } = event.user
      if (event.action === 'select' || event.action === 'active') {
        const contactsFound = contacts.find((c) => c._id === userId)
        if (!contactsFound) {
          setContacts([
            {
              ...event.user,
              active: event.action === 'active' ? true : event.user.action,
              selected: event.action === 'select' ? true : event.user.selected,
            },
            ...contacts,
          ])
          setUserFound(null)
        }
      }
      if (event.action === 'active') {
        await add(userId)
      } else if (event.action === 'inactive') {
        await remove(userId)
      }
      onUserUpdated && onUserUpdated(event)
    },
    [activeUserId, contacts]
  )

  useEffect(() => {
    ;(async () => {
      if (userContacts !== undefined) {
        const membersById = members.reduce((agg, m) => {
          agg[m._id] = m
          return agg
        }, {})
        const contactsById = userContacts.reduce((agg, contact) => {
          if (membersById[contact._id]) {
            // contact is a member
            agg[contact._id] = {
              ...contact,
              active: true,
              selected: true,
            }
            return agg
          }
          agg[contact._id] = {
            ...contact,
            active: true,
            selected: false,
          }
          return agg
        }, {})
        // remove members that are also contacts
        const contactIds = Object.keys(contactsById)
        const distantMembers = members
          .filter((m) => !contactIds.includes(m._id))
          .map((m) => ({ ...m, selected: true }))
        setContacts([...Object.values(contactsById), ...distantMembers])
      }
    })()
  }, [activeUserId, members, userContacts])

  const searchUserByEmail = useCallback(
    debounce(
      async ({ email }) => {
        const contactsFound = contacts.filter(
          (c) =>
            c._id !== activeUserId &&
            c.email.toLowerCase().includes(email.toLowerCase())
        )
        if (contactsFound.length === 0) {
          const data = await mutation({
            query: getUserByEmail,
            variables: { userEmail: email },
          })
          if (data.getUser?._id === activeUserId) {
            setUserFound(null)
          } else {
            setUserFound(data.getUser)
          }
        } else {
          setUserFound(null)
        }
      },
      1000,
      { leading: false, trailing: true }
    ),
    [contacts, activeUserId]
  )

  const updateFilter = useCallback((event) => {
    const email = event.target.value
    setFilter(email)
    searchUserByEmail({ email })
  }, [])

  const inactiveUser =
    filter.length > 0 && contactsFound.length === 0 && !userFound
      ? { _id: 'inactive', email: filter, state: 'inactive' }
      : undefined

  return (
    <>
      <div className={styles.header}>
        <Field
          className={styles.searchField}
          type="text"
          icon={Search}
          value={filter}
          placeholder={t('contact.searchField.placeholder')}
          onChange={updateFilter}
        />
      </div>
      <div className={styles.contacts}>
        {showActiveUser && (
          <ContactItem
            key={activeUserId}
            user={activeUser}
            selected
            active={false}
            disabled
            selectedIcon={selectedIcon}
            unselectedIcon={unselectedIcon}
          />
        )}
        {contactsFound.map((user) => (
          <ContactItem
            key={user._id}
            user={user}
            selected={user.selected}
            active={user.active}
            onUserUpdated={handleContactUpdate}
            selectedIcon={selectedIcon}
            unselectedIcon={unselectedIcon}
          />
        ))}
        {userFound && (
          <ContactItem
            key={userFound._id}
            user={userFound}
            hideName={true}
            selectedIcon={selectedIcon}
            unselectedIcon={unselectedIcon}
            onUserUpdated={handleContactUpdate}
          />
        )}
        {inactiveUser && (
          <ContactItem
            key="inactive"
            user={inactiveUser}
            muted={true}
            selectedIcon={selectedIcon}
            unselectedIcon={unselectedIcon}
            onUserUpdated={handleContactUpdate}
          />
        )}
      </div>
    </>
  )
}

ContactSearch.propTypes = {
  members: PropTypes.array,
  className: PropTypes.string,
  onUserUpdated: PropTypes.func,
  selectedIcon: PropTypes.element,
  unselectedIcon: PropTypes.element,
  showActiveUser: PropTypes.bool,
}
