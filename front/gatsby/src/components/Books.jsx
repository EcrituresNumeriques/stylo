import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'

import askGraphQL from '../helpers/graphQL'
import styles from './books.module.scss'

import Book from './Book'

const mapStateToProps = ({ activeUser, sessionToken, applicationConfig }) => {
  return { activeUser, sessionToken, applicationConfig }
}

const ConnectedBooks = (props) => {
  const [isLoading, setIsLoading] = useState(true)
  const [displayName, setDisplayName] = useState(props.activeUser.displayName)
  const [tags, setTags] = useState([])
  const [needReload, setNeedReload] = useState(true)

  useEffect(() => {
    if (needReload) {
      //Self invoking async function
      ;(async () => {
        try {
          const query = `query($user:ID!){user(user:$user){ displayName tags{ _id name updatedAt articles{ _id title updatedAt versions(limit:1){ _id version revision message } } } } }`
          const user = { user: props.activeUser._id }
          setIsLoading(true)
          const data = await askGraphQL(
            { query, variables: user },
            'fetching articles',
            props.sessionToken,
            props.applicationConfig
          )
          //Need to sort by updatedAt desc
          setTags(data.user.tags.reverse())
          setDisplayName(data.user.displayName)
          setIsLoading(false)
          setNeedReload(false)
        } catch (err) {
          alert(err)
        }
      })()
    }
  }, [needReload])

  return (
    <section className={styles.section}>
      <h1>Books for {displayName}</h1>
      <p>
        Books are like super-tags, they are a collection of articles that you
        can sort and export all at once
      </p>
      <p>Below are your tags eligible to be books:</p>
      {!isLoading &&
        tags.map((t) => (
          <Book
            key={`book-${t._id}`}
            {...t}
            setNeedReload={() => setNeedReload(true)}
          />
        ))}
    </section>
  )
}

const Books = connect(mapStateToProps)(ConnectedBooks)
export default Books
