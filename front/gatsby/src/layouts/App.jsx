import React, { Suspense } from 'react'
import { connect } from 'react-redux'

import Header from '../components/Header'
import Loading from '../components/Loading'

import centeredStyles from './centered.module.scss'
import fullPageStyles from './fullpage.module.scss'
import wrappedStyles from './wrapped.module.scss'
import '../styles/general.scss'

const mapStateToProps = ({ hasBooted }) => {
  return { hasBooted }
}

const App = (props) => {
  const { layout, hasBooted } = props

  let styles
  if (layout === 'wrapped') {
    styles = wrappedStyles
  } else if (layout === 'fullPage') {
    styles = fullPageStyles
  } else if (layout === 'centered') {
    styles = centeredStyles
  } else {
    // default
    styles = centeredStyles
  }
  return (
    <div className={styles.grid}>
      <Header className={styles.header} />
      <main className={styles.main}>
        <Suspense fallback={<Loading />}>
          {hasBooted && props.children}
          {!hasBooted && <Loading />}
        </Suspense>
      </main>
    </div>
  )
}

export default connect(mapStateToProps)(App)
