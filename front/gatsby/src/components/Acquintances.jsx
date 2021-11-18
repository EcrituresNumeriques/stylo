import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Send, Share } from 'react-feather'

import styles from './acquintances.module.scss'
import formStyles from './field.module.scss'

import Button from './Button'
import Field from './Field'

import AcquintanceService from '../services/AcquintanceService'

const mapStateToProps = ({ activeUser, applicationConfig }) => {
  return { activeUser, applicationConfig }
}

function ConnectedAcquintances ({ _id: articleId, activeUser, setNeedReload, cancel, applicationConfig }) {
  const [acquintances, setAcquintances] = useState([])
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(true)
  const userId = activeUser._id
  const acquintanceService = new AcquintanceService(userId, applicationConfig)

  const addContact = async () => {
    console.log('addContact', contact)
    try {
      await acquintanceService.addAcquintance(contact)
    } catch (err) {
      console.error(`Unable to add acquitance ${contact} (userId: ${userId})`, err)
      alert(err)
    }
    setContact('')
    setLoading(true)
  }

  const shareArticle = async (to) => {
    try {
      await acquintanceService.shareArticle(articleId, to)
    } catch (err) {
      console.error(`Unable to share article ${articleId} with ${to} (userId: ${userId})`, err)
      alert(err)
    }
    setNeedReload()
    cancel()
  }

  const sendArticle = async (to) => {
    try {
      await acquintanceService.sendArticle(articleId, to)
    } catch (err) {
      console.error(`Unable to send article ${articleId} with ${to} (userId: ${userId})`, err)
      alert(err)
    }
    setNeedReload()
    cancel()
  }

  useEffect(() => {
    if (loading) {
      ;(async () => {
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
        <Button>Add</Button>
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
            <Button onClick={() => sendArticle(acquintance._id)} ><Send/> Send</Button>
            <Button onClick={() => shareArticle(acquintance._id)} ><Share/> Share</Button>
          </div>
        </div>
      ))}
    </section>
  )
}

const Acquintances = connect(mapStateToProps)(ConnectedAcquintances)
export default Acquintances
