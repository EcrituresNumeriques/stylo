import React, { useState, useEffect } from "react"
import { connect } from "react-redux"
import {navigate} from "gatsby"
import {getUserProfile} from '../helpers/userProfile'


import Centered from '../layouts/Centered'

import '../styles/general.scss'

const isBrowser = () => typeof window !== 'undefined';


const mapDispatchToProps = dispatch => ({
    refreshProfile: () => getUserProfile().then(response => dispatch({ type: 'PROFILE', ...response }))
})

const mapStateToProps = ({ logedIn, hasBooted, activeUser }) => {
  return { logedIn, hasBooted, activeUser }
}

const ConnectedIndex = (props) => {
    const {refreshProfile, hasBooted} = props

    useEffect(() => {
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

    if (!hasBooted) {
      return <Centered><p>Loading…</p></Centered>
    }
    else {
      return <Centered><p>Redirecting…</p></Centered>
    }
}

const Index = connect(
    mapStateToProps, mapDispatchToProps
)(ConnectedIndex)
export default Index