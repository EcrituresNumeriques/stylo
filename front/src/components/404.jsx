import React from 'react'
import { useLocation } from 'react-router-dom'
import styles from './Error.module.scss'

export default function PageNotFound() {
  const location = useLocation()
  return (
    <section className={styles.container}>
      <article className={styles.error}>
        <h2>Error 404</h2>

        <p>
          Page not found at <code>{location.pathname}</code>.
        </p>
      </article>
    </section>
  )
}
