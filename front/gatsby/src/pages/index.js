import React, { useState, useEffect } from "react"
import { connect } from "react-redux"
import {navigate} from "gatsby"
import {getUserProfile} from '../helpers/userProfile'

import App from '../layouts/App'
import '../styles/general.scss'

const isBrowser = () => typeof window !== 'undefined';


const mapDispatchToProps = dispatch => ({
    refreshProfile: () => getUserProfile().then(response => dispatch({ type: 'PROFILE', ...response }))
})

const mapStateToProps = ({ logedIn, hasBooted, activeUser }) => {
  return { logedIn, hasBooted, activeUser }
}

const Index = (props) => {
    const {refreshProfile, hasBooted} = props

    useEffect(() => {
      console.log('index.useEffect')
        refreshProfile()
    })

    if (hasBooted && isBrowser()) {
      if (props.logedIn) {
        navigate('/articles')
      }
      else {
        navigate('/login')
      }
    }

    return <App layout="centered" header={false}><p>{hasBooted ? 'Redirecting…' : 'Loading…'}</p></App>
}

export default connect(mapStateToProps, mapDispatchToProps)(Index)
