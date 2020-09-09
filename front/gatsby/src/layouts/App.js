import React, { useEffect } from 'react'
import { connect, useDispatch } from 'react-redux'
import { getUserProfile } from '../helpers/userProfile'

import SEO from '../components/SEO'
import Header from '../components/Header'

import centeredStyles from './centered.module.scss'
import fullPageStyles from './fullpage.module.scss'
import wrappedStyles from './wrapped.module.scss'

const mapStateToProps = ({ hasBooted }) => {
  return { hasBooted }
}

const App = (props) => {
  const dispatch = useDispatch()
  useEffect(() => {
    getUserProfile().then((response) =>
      dispatch({ type: 'PROFILE', ...response })
    )
  })

  let styles
  if (props.layout === 'wrapped') {
    styles = wrappedStyles
  } else if (props.layout === 'fullPage') {
    styles = fullPageStyles
  } else if (props.layout === 'centered') {
    styles = centeredStyles
  } else {
    // default
    styles = centeredStyles
  }
  return (
    <div className={styles.grid}>
      <SEO {...props} />
      <Header className={styles.header} />
      <main className={styles.main}>{props.children}</main>
    </div>
  )
}

export default connect(mapStateToProps)(App)
