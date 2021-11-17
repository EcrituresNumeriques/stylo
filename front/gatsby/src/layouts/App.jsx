import React, { Suspense } from 'react'
import { useSelector } from 'react-redux'

import Header from '../components/Header'
import Loading from '../components/Loading'

import centeredStyles from './centered.module.scss'
import fullPageStyles from './fullpage.module.scss'
import wrappedStyles from './wrapped.module.scss'
import '../styles/general.scss'

const allStyles = {
  wrapped: wrappedStyles,
  fullPage: fullPageStyles,
  centered: centeredStyles,
}

export default function StyloApp (props) {
  const hasBooted = useSelector(state => state.hasBooted)
  const { layout, shell = true } = props

  let styles = shell === false ? allStyles.fullPage : allStyles[layout]

  return (
    <div className={styles.grid}>
      {shell && <Header className={styles.header} />}
      <main className={styles.main}>
        <Suspense fallback={<Loading />}>
          {hasBooted && props.children}
          {!hasBooted && <Loading />}
        </Suspense>
      </main>
    </div>
  )
}
