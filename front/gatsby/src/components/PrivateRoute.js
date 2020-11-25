import React from 'react'
import { connect } from 'react-redux'
import { navigate } from 'gatsby'

import Login from './Login'

const mapStateToProps = ({ logedIn }) => {
  return { logedIn }
}

const PrivateRoute = ({ logedIn, redirectTo, children }) => {
  if (logedIn) {
    if (redirectTo) {
      navigate(redirectTo)
      return <></>
    }
    return <>{children}</>
  }
  return <Login />
}

export default connect(mapStateToProps)(PrivateRoute)
