import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Send, UserMinus, UserPlus } from 'react-feather'

import styles from './acquintances.module.scss'
import formStyles from './field.module.scss'

import Button from './Button'
import Field from './Field'

import AcquintanceService from '../services/AcquintanceService'

const mapStateToProps = ({ activeUser, applicationConfig }) => {
  return { activeUser, applicationConfig }
}

function ConnectedAcquintances ({ article, activeUser, setNeedReload, cancel, applicationConfig }) {
  const [acquintances, setAcquintances] = useState([])
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(true)
  const [contributors, setContributors] = useState(article.contributors)
  const articleId = article._id
  const userId = activeUser._id
  const acquintanceService = new AcquintanceService(userId, applicationConfig)

  const sharedAccountsIds = activeUser.permissions.map(({ user }) => user._id)
  const contributorsIds = contributors.map(({ user }) => user._id)

  const addContact = async () => {
    try {
      await acquintanceService.addAcquintance(contact)
      setContact('')
      setLoading(true)
    } catch (err) {
      console.error(`Unable to add acquitance ${contact} (userId: ${userId})`, err)
      alert(err)
    }
  }

  const shareArticle = async (to) => {
    try {
      const { shareArticle:article } = await acquintanceService.shareArticle(articleId, to)
      setContributors(article.contributors)
    } catch (err) {
      console.error(`Unable to share article ${articleId} with ${to} (userId: ${userId})`, err)
      alert(err)
    }
  }

  const unshareArticle = async (to) => {
    try {
      const { unshareArticle:article } = await acquintanceService.unshareArticle(articleId, to)
      setContributors(article.contributors)
    } catch (err) {
      console.error(`Unable to unshare article ${articleId} with ${to} (userId: ${userId})`, err)
      alert(err)
    }
  }

  const duplicateArticle = async (to) => {
    try {
      await acquintanceService.duplicateArticle(articleId, to)
    } catch (err) {
      console.error(`Unable to duplicate article ${articleId} with ${to} (userId: ${userId})`, err)
      alert(err)
    }
    setNeedReload()
    cancel()
  }

  useEffect(() => {
    if (loading) {
      (async () => {
        const data = await acquintanceService.getAcquintances()
        setLoading(false)
        setAcquintances(data.user.acquintances)
      })()
    }
  }, [loading])

  return (
    <section className={styles.acquintances}>
      <form onSubmit={(event) => {
        event.preventDefault()
        addContact()
      }} className={formStyles.inlineFields}>
        <Field
          autoFocus={true}
          className={formStyles.fullWidth}
          placeholder='Email of the contact you want to add'
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
        <Button type="submit">Add</Button>
      </form>
      {loading && <p>Loading...</p>}
      {!loading && acquintances.length === 0 && <p>No acquintances</p>}
      {acquintances.map((acquintance) => (
        <div key={`acquintance-${acquintance._id}`} className={styles.acquintance}>
          <div>
            <span>{acquintance.displayName}</span>
            <a href={"mailto:" + acquintance.email} className={styles.acquintanceEmail}>{acquintance.email}</a>
          </div>
          <div className={styles.acquintanceActions}>
            {sharedAccountsIds.includes(acquintance._id) === false && <>
              <Button onClick={() => duplicateArticle(acquintance._id)} ><Send/> Send a Copy</Button>
              {!contributorsIds.includes(acquintance._id) && <Button onClick={() => shareArticle(acquintance._id)} >
                <UserPlus /> Grant Access
              </Button>}
              {contributorsIds.includes(acquintance._id) && <Button onClick={() => unshareArticle(acquintance._id)} >
                <UserMinus /> Revoke Access
              </Button>}
            </>}

            {sharedAccountsIds.includes(acquintance._id) === true && <small>
              already shared via full access — <Link to="/credentials">manage</Link>
            </small>}
          </div>
        </div>
      ))}
    </section>
  )
}

const Acquintances = connect(mapStateToProps)(ConnectedAcquintances)
export default Acquintances
