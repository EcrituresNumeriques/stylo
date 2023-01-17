import React, { useState, useEffect } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import { CurrentUserContext } from '../contexts/CurrentUser'

import { useGraphQL } from '../helpers/graphQL'
import { getTags as query } from './Books.graphql'
import styles from './articles.module.scss'

import Book from './Book'
import Loading from './Loading'
import SelectUser from './SelectUser'
import { useActiveUserId } from '../hooks/user'

export default function Books () {
  const activeUser = useSelector(state => state.activeUser, shallowEqual)
  const [isLoading, setIsLoading] = useState(true)
  const [tags, setTags] = useState([])
  const [currentUser, setCurrentUser] = useState(activeUser)
  const [userAccounts, setUserAccounts] = useState([])
  const currentUserId = useActiveUserId()

  const runQuery = useGraphQL()

  useEffect(() => {
    //Self invoking async function
    (async () => {
      try {
        setIsLoading(true)
        const data = await runQuery({ query, variables: { user: currentUserId } })
        //Need to sort by updatedAt desc
        setTags(data.tags.reverse())
        setCurrentUser(data.user)
        setUserAccounts(data.userGrantedAccess)
        setIsLoading(false)
      } catch (err) {
        alert(err)
      }
    })()
  }, [currentUserId])

  return (<CurrentUserContext.Provider value={currentUser}>
    <section className={styles.section}>
      <header className={styles.articlesHeader}>
        <h1>{tags.length} books for </h1>
        <SelectUser accounts={userAccounts} />
      </header>

      <p>
        Books are like super-tags, they are a collection of articles that you
        can sort and export all at once.<br />
        Below are your tags eligible to be books.
      </p>

      <hr className={styles.horizontalSeparator} />

      {isLoading ? <Loading /> : tags.map((t) => (
          <Book key={`book-${t._id}`} {...t} />
        ))}
    </section>
  </CurrentUserContext.Provider>)
}
