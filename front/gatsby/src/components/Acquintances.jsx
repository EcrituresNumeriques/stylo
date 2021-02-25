import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'

import styles from './acquintances.module.scss'
import formStyles from './field.module.scss'

import askGraphQL from '../helpers/graphQL'
import Button from './Button'
import Field from './Field'

const mapStateToProps = ({ sessionToken, activeUser, applicationConfig }) => {
  return { sessionToken, activeUser, applicationConfig }
}

function ConnectedAcquintances (props) {
  const [acquintances, setAcquintances] = useState([])
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState('share')

  const addContact = async (e) => {
    e.preventDefault()
    const query = `mutation($user:ID!,$email:String!){addAcquintance(email:$email,user:$user){ _id }}`
    const variables = { user: props.activeUser._id, email: contact }
    await askGraphQL(
      { query, variables },
      'Adding acquintances',
      props.sessionToken,
      props.applicationConfig
    )
    setContact('')
    setLoading(true)
  }

  const shareWith = async (to) => {
    try {
      const query = `mutation($user:ID!,$article:ID!,$to:ID!){
        ${action}Article(article:$article,to:$to,user:$user){
          _id
        }
      }`
      const variables = {
        user: props.activeUser._id,
        to: to,
        article: props._id,
      }
      await askGraphQL(
        { query, variables },
        'Sharing Article',
        props.sessionToken,
        props.applicationConfig
      )
      props.setNeedReload()
      props.cancel()
    } catch (err) {
      alert(err)
    }
  }

  useEffect(() => {
    if (loading) {
      ;(async () => {
        const query = `query($user:ID!){
          user(user:$user){
            acquintances{
              _id
              displayName
              email
            }
          }
        }`
        const variables = { user: props.activeUser._id }
        const data = await askGraphQL(
          { query, variables },
          'Fetching acquintances',
          props.sessionToken,
          props.applicationConfig
        )
        setLoading(false)
        setAcquintances(data.user.acquintances)
      })()
    }
  }, [loading])

  return (
    <section className={styles.acquintances}>
      <nav>
        <button
          onClick={function () {
            setAction('share')
          }}
          className={action === 'share' ? styles.selected : null}
        >
          Share
        </button>
        <button
          onClick={() => setAction('send')}
          className={action === 'send' ? styles.selected : null}
        >
          Send
        </button>
      </nav>
      <form onSubmit={(e) => addContact(e)} className={formStyles.inlineFields}>
        <Field
          autoFocus={true}
          className={formStyles.fullWidth}
          placeholder="Email of the contact you want to add"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
        <Button>Add</Button>
      </form>
      {loading && <p>Loading...</p>}
      {!loading && acquintances.length === 0 && <p>No acquintances</p>}
      {acquintances.map((a, i) => (
        <p key={`acquintance-${a._id}`}>
          <span onClick={() => shareWith(a._id)}>{action}</span>
          {a.displayName}
          <br />({a.email})
        </p>
      ))}
    </section>
  )
}

const Acquintances = connect(mapStateToProps)(ConnectedAcquintances)

export default Acquintances
