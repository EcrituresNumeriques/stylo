import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Send, UserMinus, UserPlus } from 'react-feather'

import styles from './Share.module.scss'

import AcquintanceAddForm from './AcquintanceAddForm'
import Button from './Button'

import * as queries from './Acquintances.graphql'
import { useGraphQL } from '../helpers/graphQL'
import { merge } from '../helpers/acquintances.js'
import { useCurrentUser } from '../contexts/CurrentUser'

export default function ArticleShare ({ article, setNeedReload, cancel }) {
  const [acquintances, setAcquintances] = useState([])
  const [loading, setLoading] = useState(true)
  const [contributors, setContributors] = useState(article.contributors)
  const activeUser = useCurrentUser()
  const userId = activeUser._id
  const runQuery = useGraphQL()

  const sharedAccountsIds = activeUser.permissions.map(({ user }) => user._id)
  const contributorsIds = contributors.map(({ user }) => user._id)

  const allContributors = useMemo(() => merge(contributors, acquintances), [acquintances, contributors])

  const shareArticle = async (to) => {
    try {
      const { shareArticle } = await runQuery({
        query: queries.shareArticle,
        variables: { to, article: article._id, user: userId }
      })
      setContributors(shareArticle.contributors)
    } catch (err) {
      console.error(`Unable to share article ${article._id} with ${to} (userId: ${userId})`, err)
      alert(err)
    }
  }

  const unshareArticle = async (to) => {
    try {
      const { unshareArticle } = await runQuery({
        query: queries.unshareArticle,
        variables: { article: article._id, user: userId, to }
      })
      setContributors(unshareArticle.contributors)
    } catch (err) {
      console.error(`Unable to unshare article ${article._id} with ${to} (userId: ${userId})`, err)
      alert(err)
    }
  }

  const duplicateArticle = async (to) => {
    try {
      await runQuery({
        query: queries.duplicateArticle,
        variables: { article: article._id, user: userId, to }
      })
    } catch (err) {
      console.error(`Unable to duplicate article ${article._id} with ${to} (userId: ${userId})`, err)
      alert(err)
    }
    setNeedReload()
    cancel()
  }

  useEffect(() => {
    runQuery({ query: queries.getAcquintances, variables: { user: userId } })
      .then(({ user }) => {
        setLoading(false)
        setAcquintances(user.acquintances)
      })
  }, [])

  const refreshContacts = useCallback((acquintances) => setAcquintances(acquintances), [])

  return (
    <section className={styles.acquintances}>
      <AcquintanceAddForm onAdd={refreshContacts} />
      {loading && <p>Loading...</p>}
      {!loading && allContributors.length === 0 && <p>No acquintances</p>}
      {allContributors.map((user) => (
        <div key={`acquintance-${user._id}`} className={styles.acquintance}>
          <div>
            <span>
              {user.displayName}
              {' '}
              {userId === user._id && <small className={styles.sameAccount}>(this account)</small>}
            </span>
            {user.email && <a href={"mailto:" + user.email} className={styles.acquintanceEmail}>{user.email}</a>}
          </div>
          <div className={styles.acquintanceActions}>
            {sharedAccountsIds.includes(user._id) === false && <>
              <Button onClick={() => duplicateArticle(user._id)} ><Send/> Send a Copy</Button>
              {!contributorsIds.includes(user._id) && <Button onClick={() => shareArticle(user._id)} >
                <UserPlus /> Grant Access
              </Button>}
              {contributorsIds.includes(user._id) && <Button onClick={() => unshareArticle(user._id)} >
                <UserMinus /> Revoke Access
              </Button>}
            </>}

            {sharedAccountsIds.includes(user._id) && <small>
              already shared via full access — <Link to="/credentials">manage</Link>
            </small>}
          </div>
        </div>
      ))}
    </section>
  )
}
