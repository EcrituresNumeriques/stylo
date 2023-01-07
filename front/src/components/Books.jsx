import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

import { useGraphQL } from '../helpers/graphQL'
import { getTags as query } from './Books.graphql'
import styles from './articles.module.scss'

import Book from './Book'
import Loading from './Loading'

export default function Books () {
  const [isLoading, setIsLoading] = useState(true)
  const [tags, setTags] = useState([])
  const displayName = useSelector(state => state.activeUser.displayName)
  const userId = useSelector(state => state.activeUser._id)
  const runQuery = useGraphQL()

  useEffect(() => {
    //Self invoking async function
    (async () => {
      try {
        setIsLoading(true)
        const data = await runQuery({ query, variables: { user: userId } })
        //Need to sort by updatedAt desc
        setTags(data.tags.reverse())
        setIsLoading(false)
      } catch (err) {
        alert(err)
      }
    })()
  }, [])

  return (
    <section className={styles.section}>
      <header className={styles.articlesHeader}>
        <h1>{tags.length} books for {displayName}</h1>
      </header>

      <p>
        Books are like super-tags, they are a collection of articles that you
        can sort and export all at once.<br />
        Below are your tags eligible to be books.
      </p>

      <hr className={styles.horizontalSeparator} />

      {isLoading ? <Loading /> : tags.map((t) => (
          <Book
            key={`book-${t._id}`}
            {...t}
          />
        ))}
    </section>
  )
}
