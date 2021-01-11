import React from 'react'
import { connect } from 'react-redux'

import Login from './Login'
import App from '../layouts/App'

const mapStateToProps = ({ logedIn }) => {
  return { logedIn }
}

const PrivateRoute = ({ logedIn, children }) => {
  if (logedIn) {
    return <>{children}</>
  }
  return (
    <App layout="centered" header={false}>
      <Login />
    </App>
  )
}

export default connect(mapStateToProps)(PrivateRoute)
