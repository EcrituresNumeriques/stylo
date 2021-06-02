import React, { Suspense } from 'react'
import { useSelector } from 'react-redux'

import Header from '../components/Header'
import Loading from '../components/Loading'

import centeredStyles from './centered.module.scss'
import fullPageStyles from './fullpage.module.scss'
import wrappedStyles from './wrapped.module.scss'
import '../styles/general.scss'

const mapStateToProps = ({ hasBooted }) => {
  return { hasBooted }
}

export default function StyloApp (props) {
  const hasBooted = useSelector(state => state.hasBooted)
  const { layout, shell = true } = props

  let styles = centeredStyles
  if (layout === 'wrapped') {
    styles = wrappedStyles
  } else if (!shell || layout === 'fullPage') {
    styles = fullPageStyles
  } else if (layout === 'centered') {
    styles = centeredStyles
  }

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
