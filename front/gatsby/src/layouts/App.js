import React, { useEffect } from 'react'
import { connect } from 'react-redux'

import SEO from '../components/SEO'
import Header from '../components/Header'

import centeredStyles from './centered.module.scss'
import fullPageStyles from './fullpage.module.scss'
import wrappedStyles from './wrapped.module.scss'

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
      <SEO {...props} />
      <Header className={styles.header} />
      <main className={styles.main}>
        {hasBooted && props.children}
        {!hasBooted && <p>Loading…</p>}
      </main>
    </div>
  )
}

export default connect(mapStateToProps)(App)
